import { DetectedLicense, DetectedLicenseSummary } from "../../../../api/types";
import { modelProvider } from "../../../services/ModelProvider";
import { ModelAdapter } from "../adapter";

export type IDetectedLicense = DetectedLicense;



export class DetectedLicenseSummaryAdapter implements ModelAdapter<Array<IDetectedLicense>,Record<string, DetectedLicenseSummary>> {
    async run (input: Array<IDetectedLicense>): Promise<Record<string,DetectedLicenseSummary>> {
       const incompatibleLicenses = await modelProvider.model.license.getDetectedLicenseData();
       const incompatibleLicensesMapper = new Map<string,{spdxid: string, incompatible_with: string, copyLeft: string, patent_hints: string}>();
       incompatibleLicenses.forEach((il: any)=>{ incompatibleLicensesMapper.set(il.spdxid , il)});
       const detectedLicenseSummary = input.reduce((acc: Record<string,DetectedLicenseSummary> ,curr: DetectedLicense)=> {
        const incompatible = incompatibleLicensesMapper.get(curr.spdxid);    
        acc[curr.spdxid] = {
            ...curr,
                    // Default values or calculations for missing properties
                    label: curr.spdxid,
                    componentList: [],
                    dependencyComponentList:[], // Default value or calculate as needed
                    incompatible_with: incompatible?.incompatible_with ? incompatible?.incompatible_with.split(','): [],
                    copyLeft: incompatible?.copyLeft ? incompatible?.copyLeft : '',
                    patent_hints: incompatible?.patent_hints ? incompatible?.patent_hints : ''
        };
        return acc;
        },{} as Record<string, DetectedLicenseSummary>);

        return detectedLicenseSummary;
    }

   

}

export const detectedLicenseSummaryAdapter = new DetectedLicenseSummaryAdapter();