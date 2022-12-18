function main() {
  // スプレッドシートからデータを取得する
  const SPREADSHEET_KEY = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_KEY");
  const workBook = SpreadsheetApp.openById(SPREADSHEET_KEY!);
  const workSheet = workBook.getSheetByName('シート1');
  const data = workSheet?.getRange(1, 1, workSheet?.getLastRow()!, workSheet?.getLastColumn()!).getDisplayValues();
  // 取得したデータを整形する
  const cols = data![0];
  const formattedData = []
  for (var i=1; i<data!.length;i++) {
    const row: {[key: string]: string|string[]} = {};
    for (var h=0; h<cols.length;h++) {
      const k = cols[h];
      let v: string|string[] = data![i][h];
      if (k=='serviceUid' && v.length==0) {
        continue
      }
      if (k.match(/.*enable/) || k=='companyPublic') {
        v = JSON.parse(v.toLowerCase())
      } else if (k.match(/.*Features/) || k=='businessModel') {
        v = (v.length==0) ? [] : String(v).split(',').map((_v)=>_v.trim())
      }
      row[k] = v
      }
    formattedData.push(serviceModel(row))
  }
  // firebaseの設定
  const props = PropertiesService.getScriptProperties();
  const [email, key, projectId] = [props.getProperty('CLIENT_EMAIL'), props.getProperty('PRIVATE_KEY')!.replace(/\\n/g, '\n'), props.getProperty('PROJECT_ID')];
  const firestore = FirestoreApp.getFirestore(email, key, projectId);
  // firestoreに登録済みのサービス一覧の取得
  const existedServices: string[] = firestore.getDocuments('services').map((value: {[key: string]: string})=>value.name.split('/').pop());
  const updatedServices: string[] = []
  // マスターデータのアップデート
  let [areas, employments, jobTypes, ages, others]: any[] = [[], [], [], [], []];
  for (var i=0; i<formattedData.length; i++) {
    const service: Service = formattedData[i]
    areas = areas.concat(service.areaFeatures);
    employments = employments.concat(service.employmentFeatures);
    jobTypes = jobTypes.concat(service.jobTypeFeatures);
    ages = ages.concat(service.ageFeatures);
    others = others.concat(service.otherFeatures);
  }
  const msts: any[][] = [['areas', areas], ['employments', employments], ['jobTypes', jobTypes], ['ages', ages], ['others', others]];
  for (var c=0; c<msts.length;c++) {
    const newMst = msts[c][1].filter((value: string, i: number)=>msts[c][1].indexOf(value)==i);
    const existedMst = firestore.getDocuments(msts[c][0]).map((value: {[key: string]: string})=>value.name.split('/').pop());
    const createMst = newMst.filter((value: string)=>existedMst.indexOf(value)==-1);
    const deleteMst = existedMst.filter((value: string)=>newMst.indexOf(value)==-1);
    for (var i=0; i<createMst.length;i++) {
      firestore.createDocument(msts[c][0]+'/'+createMst[i], {});
    }
    for (var i=0; i<deleteMst.length;i++) {
      firestore.deleteDocument(msts[c][0]+"/"+deleteMst[i]);
    }
  }
  // マスタのデフォルト値を定義
  const mstSheet = workBook.getSheetByName('mst');
  const masterAllData = mstSheet?.getRange(1, 1, mstSheet?.getLastRow()!, mstSheet?.getLastColumn()!).getDisplayValues();
  const masterAll: {[key: string]: string[]} = {};
  for (var i=0; i<masterAllData!.length;i++) {
    masterAll[masterAllData![i][0]] = String(masterAllData![i][1]).split(',').map((_v)=>_v.trim())
  }
  const allJobTypes = firestore.getDocuments('jobTypes').map((value: {[key: string]: string})=>value.name.split('/').pop())
  // サービスの更新
  for (var i=0; i<formattedData.length; i++) {
    const service: Service = formattedData[i]
    if (service.serviceUid) {
      // UIDがある場合は更新処理を行う
      const serviceUid = service.serviceUid;
      delete service['serviceUid'];
      if (service['areaFeatures'].length==0) {
        service['areaFeatures'] = masterAll['areaFeatures'];
      }
      if (service['employmentFeatures'].length==0) {
        service['employmentFeatures'] = masterAll['employmentFeatures'];
      }
      if (service['jobTypeFeatures'].length==0) {
        service['jobTypeFeatures'] = allJobTypes;
      }
      if (service['ageFeatures'].length==0) {
        service['ageFeatures'] = masterAll['ageFeatures'];
      }
      firestore.updateDocument('services/'+serviceUid, service);
      updatedServices.push(serviceUid)
    } else {
      // UIDがない場合は新規登録処理を行い、IDをスプシに保存する
      const serviceUid = firestore.createDocument('services', service).name.split('/').pop();
      const rowNum = workSheet?.createTextFinder(service.url!).matchEntireCell(true).findAll()[0].getRow();
      workSheet?.getRange(rowNum!, 1).setValue(serviceUid)
    }
  }
  // サービスの削除
  const deleteServices = existedServices.filter((value: string)=>updatedServices.indexOf(value)==-1);
  for (var i=0; i<deleteServices.length; i++) {
    firestore.deleteDocument("services/"+deleteServices[i]);
  }
}
