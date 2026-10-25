// All records are illustrative DEMO DATA, not factual election information.
// Replace with verified, date-specific backend results before public launch.
export type Source = { title: string; url?: string; publisher: string; date?: string };
export type Position = { short: string; detail: string; sources: Source[] };
export type Candidate = { id: string; name: string; initials: string; party: string; office: string; tagline: string; bio: string; background: string[]; donations: string; positions: Record<string,Position> };
const unavailable = ():Position => ({short:'No verified position available in this demo.',detail:'When the verified election-data API is connected, a documented position and its underlying evidence will appear here.',sources:[]});
const example = (subject:string, candidate:string):Position => ({short:`Illustrative ${subject.toLowerCase()} position for ${candidate}.`,detail:`This is sample interface content only. In production, this panel will contain sourced statements, legislative records when relevant, publication dates, and a clearly distinguished explanation of ${candidate}'s position on ${subject.toLowerCase()}.`,sources:[]});
export const issues = ['Education','Housing','Healthcare','Environment','Cost of living','Transportation','Public safety','Taxes'];
const makeCandidate=(id:string,name:string,initials:string,party:string,office:string,tagline:string):Candidate=>({id,name,initials,party,office,tagline,bio:`${name} is a fictional placeholder created for the Orange You Voting interface demo. Replace this section with a verified biography from the election-data backend.`,background:['Verified professional experience will appear here','Previous public service, if applicable','Education and biographical sources'],donations:'Verified campaign finance data is not connected in demo mode.',positions:Object.fromEntries(issues.map(i=>[i,example(i,name)]))});
export const candidates:Candidate[] = [
 makeCandidate('alex-rivera','Alex Rivera','AR','Nonpartisan','City Commission','Community planning and neighborhood priorities'),
 makeCandidate('jordan-lee','Jordan Lee','JL','Nonpartisan','City Commission','Local services and civic participation'),
 makeCandidate('taylor-morgan','Taylor Morgan','TM','Nonpartisan','City Commission','Transportation and infrastructure'),
 makeCandidate('sam-patel','Sam Patel','SP','Nonpartisan','School Board','Student services and family engagement'),
 makeCandidate('casey-brooks','Casey Brooks','CB','Nonpartisan','School Board','Classroom resources and opportunities'),
 makeCandidate('morgan-davis','Morgan Davis','MD','Demo affiliation','Florida House','State programs and constituent services'),
 makeCandidate('jamie-chen','Jamie Chen','JC','Demo affiliation','Florida House','Public services and community needs'),
 makeCandidate('avery-quinn','Avery Quinn','AQ','Demo affiliation','U.S. Senate','Federal priorities and constituent outreach'),
];
export const offices=['City Commission','School Board','Florida House','U.S. Senate'];
export type Measure={id:string;title:string;kind:string;description:string;yes:string[];no:string[];notes:string};
export const measures:Measure[]=[
 {id:'1',title:'Example community-services measure',kind:'Illustrative local ballot measure',description:'This is a sample proposal used to demonstrate how a clear ballot-measure explanation could work. It is not an actual Florida ballot measure.',yes:['The proposed change would take effect if approved under the measure’s actual legal terms.','Implementation details and fiscal implications would be summarized from official records.'],no:['The proposed change would not take effect.','Existing law or policy would generally remain in place unless another action changes it.'],notes:'Exact legal effects require the verified text of a real measure.'},
 {id:'2',title:'Example public facilities measure',kind:'Illustrative local ballot measure',description:'A second fictional example demonstrates switching between amendments and local referendum questions.',yes:['The proposal would be approved according to its official language.','Documented effective dates and budget implications would appear here.'],no:['The proposal would not be adopted through this vote.','The prior legal framework would remain unless modified separately.'],notes:'The underlying official ballot text and jurisdiction must be verified.'},
 {id:'3',title:'Example county policy measure',kind:'Illustrative county ballot measure',description:'A third placeholder illustrates the same Yes-versus-No interface for a county-specific question.',yes:['Voting Yes would approve the proposal as written.','Any qualified implementation conditions would appear here.'],no:['Voting No would reject the proposed change.','The status quo would remain subject to other lawful changes.'],notes:'The displayed proposal is fictional and should not be used for voting decisions.'}
];
export const getPosition=(candidate:Candidate,issue:string):Position=>candidate.positions[issue]||unavailable();
