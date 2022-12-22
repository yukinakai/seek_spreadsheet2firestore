type Service = {
  serviceUid?: string;
  name: string;
  url: string;
  summary: string;
  detail: string;
  areaFeatures: string[];
  employmentFeatures: string[];
  jobTypeFeatures: string[];
  ageFeatures: string[];
  otherFeatures: string[];
  searchOffers: {enable: boolean, remarks: string};
  apply: {enable: boolean, remarks: string};
  agentService: {enable: boolean, remarks: string};
  scout: {enable: boolean, remarks: string};
  otherFunction: string;
  companyName: string;
  companyUrl: string;
  businessModel: string[];
  companyBusiness: string;
  companyPublic: boolean;
  score1?: number;
  score2?: number;
}

function serviceModel(data: any) {
  const service: Service = {
    name: data.name,
    url: data.url,
    summary: data.summary,
    detail: data.detail,
    areaFeatures: data.areaFeatures,
    employmentFeatures: data.employmentFeatures,
    jobTypeFeatures: data.jobTypeFeatures,
    ageFeatures: data.ageFeatures,
    otherFeatures: data.otherFeatures,
    searchOffers: {
      enable: data['searchOffers.enable'],
      remarks: data['searchOffers.remarks'],
    },
    apply: {
      enable: data['apply.enable'],
      remarks: data['apply.remarks'],
    },
    agentService: {
      enable: data['agentService.enable'],
      remarks: data['agentService.remarks'],
    },
    scout: {
      enable: data['scout.enable'],
      remarks: data['scout.remarks'],
    },
    otherFunction: data.otherFunction,
    companyName: data.companyName,
    companyUrl: data.companyUrl,
    businessModel: data.businessModel,
    companyBusiness: data.companyBusiness,
    companyPublic: data.companyPublic
  }
  if (data.serviceUid) {
    service.serviceUid = data.serviceUid
  }
  return service
}
