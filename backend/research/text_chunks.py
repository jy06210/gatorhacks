"""Contiguous byte-bounded chunks, preferring paragraph and sentence boundaries."""


def split_chunks(text: str, model, max_chunks: int = 8) -> tuple[list[str], bool]:
    chunks, remaining = [], text
    while remaining and len(chunks) < max_chunks:
        from llm_batches import batch_enabled
        window = model.research_excerpt(remaining) if batch_enabled(model) else model.excerpt(remaining)
        if not window:
            raise ValueError('Model input budget cannot fit source text')
        end = len(window)
        if end < len(remaining):
            for separator in ('\n\n', '\n', '. ', '; ', ' '):
                boundary = window.rfind(separator)
                if boundary >= len(window) // 2:
                    end = boundary + len(separator)
                    break
        chunks.append(remaining[:end])
        remaining = remaining[end:]
    return chunks, bool(remaining)
