"""Bounded, sequential HTML retrieval. No browser or access-block bypass."""
import httpx
import trafilatura
import os
from urllib.parse import urlsplit
from urllib.robotparser import RobotFileParser
from html.parser import HTMLParser
from urllib.parse import urljoin

from schemas import SourceResult

MAX_BYTES = 2_000_000
_browser_attempts = 0


def restricted_page(raw):
    compact=raw.lower().replace(b' ',b'')
    return any(marker in compact for marker in (b'verifyyouarehuman',b'cf-chl-',b'accessdenied',
        b'justamoment...',b'"isaccessibleforfree":false',b'class="paywall',b'data-paywall'))


def usable_text(text):
    if not text or len(text.strip())<80:
        return False
    navigation=sum(term in text.lower() for term in ('skip to content','main navigation','create profile','sign in','tv listings','email preferences'))
    return not (len(text)<1800 and navigation>=3)


def browser_extract(url, client):
    """Ordinary rendering only, after successful unrestricted HTML and robots checks."""
    global _browser_attempts
    if os.getenv('RESEARCH_BROWSER_FALLBACK','1')!='1' or _browser_attempts>=2:
        raise ValueError('Browser fallback disabled or two-page budget exhausted')
    robots_url=urlsplit(url)._replace(path='/robots.txt',query='',fragment='').geturl()
    policy=client.get(robots_url,follow_redirects=True)
    if policy.status_code!=404:
        policy.raise_for_status()
        rules=RobotFileParser()
        rules.parse(policy.text.splitlines())
        if not rules.can_fetch('CandidateResearch/1.0',url):
            raise ValueError('Browser rendering disallowed by robots policy')
    _browser_attempts+=1
    from playwright.sync_api import sync_playwright
    with sync_playwright() as runtime:
        browser=runtime.chromium.launch(headless=True)
        try:
            page=browser.new_page(user_agent='CandidateResearch/1.0')
            page.route('**/*',lambda route:route.abort() if route.request.resource_type in ('image','media','font') else route.continue_())
            response=page.goto(url,timeout=20000,wait_until='domcontentloaded')
            if not response or response.status>=400:
                raise ValueError('Browser navigation unavailable; no access bypass attempted')
            page.wait_for_timeout(1500)
            if (urlsplit(page.url).hostname or '').removeprefix('www.') != (urlsplit(url).hostname or '').removeprefix('www.'):
                raise ValueError('Browser redirected to another domain; source identity requires separate verification')
            rendered=page.content().encode('utf-8')
            if len(rendered)>MAX_BYTES or restricted_page(rendered):
                raise ValueError('Rendered content restricted or oversized')
            return trafilatura.extract(rendered,url=page.url,include_comments=False)
        finally:
            browser.close()


class PageDetails(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = ''
        self.links = []
        self.title = ''
        self.in_title = False
        self.link = None

    def handle_starttag(self, tag, attrs):
        if tag == 'title':
            self.in_title = True
        if tag == 'a':
            self.link = [dict(attrs).get('href', ''), self.text[-500:], '']

    def handle_data(self, data):
        self.text += ' ' + data
        if self.in_title:
            self.title += ' ' + data
        if self.link is not None:
            self.link[2] += ' ' + data

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        if tag == 'a' and self.link is not None:
            self.links.append(tuple(self.link))
            self.link = None


def fetch_source(url: str, client: httpx.Client, details: dict | None = None) -> SourceResult:
    result = SourceResult(source_url=url)
    try:
        with client.stream("GET", url, follow_redirects=True) as response:
            result.final_url = str(response.url)
            response.raise_for_status()
            if "html" not in response.headers.get("content-type", "").lower():
                raise ValueError("Source is not an HTML webpage")
            body = bytearray()
            for chunk in response.iter_bytes():
                body.extend(chunk)
                if len(body) > MAX_BYTES:
                    raise ValueError("Webpage exceeds 2 MB limit")
            raw = bytes(body)
            if details is not None:
                page = PageDetails()
                page.feed(raw.decode(response.encoding or 'utf-8', errors='replace'))
                details.update(title=page.title, links=[(urljoin(str(response.url), href), context, label) for href, context, label in page.links])
            if restricted_page(raw):
                raise ValueError("Website returned an access-block or challenge page")
            text = trafilatura.extract(raw, url=str(response.url), include_comments=False)
            if not usable_text(text):
                # Try ordinary HTML recall extraction before launching an existing browser.
                text=trafilatura.extract(raw,url=str(response.url),include_comments=False,favor_recall=True)
                if not usable_text(text):
                    try:
                        text=browser_extract(str(response.url),client)
                        result.research_diagnostics['fetch_method']='browser_render'
                    except Exception as exc:
                        result.research_diagnostics['browser_failure_type']=type(exc).__name__
                        raise ValueError('No readable text; HTML/browser extraction unavailable') from None
                if not usable_text(text):
                    raise ValueError('Empty or JavaScript-only page after bounded extraction fallback')
            result.retrieved_text = text
            result.status = "partial"
    except (httpx.HTTPError, ValueError) as exc:
        result.error = f"{type(exc).__name__}: {exc}"
    return result
