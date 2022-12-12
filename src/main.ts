function main() {
  // スプレッドシートからデータを取得する
  const SPREADSHEET_KEY = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_KEY");
  const workBook = SpreadsheetApp.openById(SPREADSHEET_KEY!);
  const workSheet = workBook.getSheetByName('シート1');
  const lastRow = workSheet?.getLastRow();
  const lastCol = workSheet?.getLastColumn();
  const data = workSheet?.getRange(1,1,lastRow!,lastCol!).getDisplayValues();
  console.log(data!)
}
