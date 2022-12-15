function main() {
  // スプレッドシートからデータを取得する
  const SPREADSHEET_KEY = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_KEY");
  const workBook = SpreadsheetApp.openById(SPREADSHEET_KEY!);
  const workSheet = workBook.getSheetByName('シート1');
  const lastRow = workSheet?.getLastRow();
  const lastCol = workSheet?.getLastColumn();
  const data = workSheet?.getRange(1,1,lastRow!,lastCol!).getDisplayValues();
  // console.log(data!)
  // 取得したデータを整形する
  const cols = data![0];
  console.log(cols)
  const formatted_data = []
  for (var i=1; i<data!.length;i++) {
    const row: {[key: string]: string|string[]} = {};
    for (var h=0; h<cols.length;h++) {
      const k = cols[h];
      if (k=='serviceUid') {
        continue //serviceUidはデータに含まない。update処理を作る際に再度考える
      }
      let v: string|string[] = data![i][h];
      if (k.match(/.*enable/) || k=='companyPublic') {
        v = JSON.parse(v.toLowerCase())
      } else if (k.match(/.*Features/) || k=='businessModel') {
        v = (v.length==0) ? [] : String(v).split(',').map((_v)=>_v.trim())
      }
      row[k] = v
    }
    formatted_data.push(row)
  }
  console.log(formatted_data)
  // 整形したデータをfirebaseに送る
  //// UIDがある場合は更新処理を行う
  //// UIDがない場合は新規登録処理を行う
}
