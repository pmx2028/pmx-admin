package com.paramount.pmx.component;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
// import org.apache.poi.ss.usermodel.Color;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public class ExcelWriter {
    private final Workbook workbook;
    private final Map<String, Object> data;
    private final HttpServletResponse response;
    private final HttpServletRequest request;

    //생성자
    public ExcelWriter(Workbook workbook, Map<String, Object> data, HttpServletResponse response, HttpServletRequest request){
        this.workbook = workbook;
        this.data = data;
        this.response = response;
        this.request = request;
    }

    //엑셀파일 만들기
    public void create(String sheetName) throws UnsupportedEncodingException{
        setFileName(request, response, mapToFileName());
        Sheet sheet = null;
        if(sheetName == null){
            sheet = workbook.createSheet();
        }else{
            sheet = workbook.createSheet(sheetName);
        }
        createHeader(sheet);
        createBody(sheet, mapToBodyList());
        createFooter(sheet);
    }

    //넘어온 모델 객체에서 파일이름 꺼내기
    private String mapToFileName(){
        return data.get("filename").toString();
    }

    //넘어온 모델 객체에서 haed이름 꺼내기
    // @SuppressWarnings("unchecked") //경고체크하지않기.
    // private List<String> mapToHeaderList(){
    //     System.out.println(data.get("header"));
    //     return (List<String>) data.get("header");
    // }

    //넘어온 모델 객체에서 body 데이터 리스트 꺼내기
    @SuppressWarnings("unchecked") //경고체크하지않기.
    private List<List<String>> mapToBodyList(){
        return (List<List<String>>) data.get("body");
    }

    //파일 이름 만들기
    private void setFileName(HttpServletRequest request, HttpServletResponse response, String fileName) throws UnsupportedEncodingException{

        String browser = request.getHeader("User-Agent");

        // 브라우저에 따른 파일명 인코딩 설정
        if (browser.indexOf("MSIE") > -1) {
            fileName = URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");
        } else if (browser.indexOf("Trident") > -1) {       // IE11
            fileName = URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");
        } else if (browser.indexOf("Firefox") > -1) {
            fileName = "\"" + new String(fileName.getBytes("UTF-8"), "8859_1") + "\"";
        } else if (browser.indexOf("Opera") > -1) {
            fileName = "\"" + new String(fileName.getBytes("UTF-8"), "8859_1") + "\"";
        } else if (browser.indexOf("Chrome") > -1) {
            StringBuffer sb = new StringBuffer();
            for (int i = 0; i < fileName.length(); i++) {
                char c = fileName.charAt(i);
                if (c > '~') {
                    sb.append(URLEncoder.encode("" + c, "UTF-8"));
                } else {
                    sb.append(c);
                }
            }
            fileName = sb.toString();
        } else if (browser.indexOf("Safari") > -1){
            fileName = "\"" + new String(fileName.getBytes("UTF-8"), "8859_1")+ "\"";
        } else {
            fileName = "\"" + new String(fileName.getBytes("UTF-8"), "8859_1")+ "\"";
        }

        response.setHeader("Content-Disposition", "attachment; filename=\"" + getFileExtension(fileName) + "\"");
    }

    //파일 확장자
    private String getFileExtension(String fileName){
        if (workbook instanceof XSSFWorkbook) {
            fileName += ".xlsx";
        }

        if (workbook instanceof SXSSFWorkbook) {
            fileName += ".xlsx";
        }

        if (workbook instanceof HSSFWorkbook) {
            fileName += ".xls";
        }

        return fileName;
    }

    //head 생성
    private void createHeader(Sheet sheet){
        if(data.get("type") != null && (
                data.get("type").equals("user")
                || data.get("type").equals("promotion")
                || data.get("type").equals("order")
            ))
        {
            // 제목있는 버전 (고객지원)
            @SuppressWarnings("unchecked")
            List<List<String>> hearderList = (List<List<String>>) data.get("header");
            createHeaderRow2(sheet, hearderList, 0);
        }else{
            // 제목없는 버전(data center)
            @SuppressWarnings("unchecked")
            List<String> hearderList = (List<String>) data.get("header");
            createHeaderRow(sheet, hearderList, 0);
        }
    }

    //body 생성
    private void createBody(Sheet sheet, List<List<String>> bodyList){

        int rowSize = bodyList.size();
        if(data.get("type") == null){
            // 제목없는 버전
            for (int i=0; i<rowSize; i++){
                createRow(sheet, bodyList.get(i), i + 1);
            }
        }else{
            // 제목있는 버전
            for (int i=0; i<rowSize; i++){
                createRow(sheet, bodyList.get(i), i + 2);
            }
        }
    }


    // footer 생성
    private void createFooter(Sheet sheet){
        if(data.get("footer") != null){
            @SuppressWarnings("unchecked") //경고체크하지않기.
            List<String> footerList = (List<String>) data.get("footer");
            createFooterRow(sheet, footerList, sheet.getLastRowNum()+1);
        }
    }

    //Header row 생성
    private void createHeaderRow(Sheet sheet, List<String> cellList, int rowNum){
        Row row = sheet.createRow(rowNum);
        Cell cell = null;
        CellStyle cellStyle = workbook.createCellStyle();

        // 폰트 지정
        Font headerFont = workbook.createFont();
        headerFont.setFontName("나눔고딕");
        headerFont.setFontHeight((short)200);
        headerFont.setColor(IndexedColors.BLACK.getIndex());
        headerFont.setBold(true);
        cellStyle.setFont(headerFont);

        int size = cellList.size();
        for (int i=0; i<size; i++){
            cell = row.createCell(i);
            cell.setCellValue(cellList.get(i));
            cell.setCellStyle(applyCellStyle(0, cellStyle));
        }
    }

    // 제목있는 버전 헤더 row
    private void createHeaderRow2(Sheet sheet, List<List<String>> cellList, int rowNum){
        Cell cell = null;
        for (int i=0; i<cellList.size(); i++){
            Row row = sheet.createRow(rowNum+i);
            CellStyle cellStyle = workbook.createCellStyle();
            // 폰트
            Font headerFont = workbook.createFont();
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setFontHeight((short)200);   // 헤더
            headerFont.setBold(true);

            for (int j=0; j<cellList.get(i).size(); j++){
                cell = row.createCell(j);
                cell.setCellValue(cellList.get(i).get(j));
                if(i==0){
                    headerFont.setFontHeight((short)300);   // 제목
                    headerFont.setColor(IndexedColors.BLACK.getIndex());
                    cell.setCellStyle(applyCellStyle(1, cellStyle));
                }else{
                    cell.setCellStyle(applyCellStyle(2, cellStyle));
                }
            }
            cellStyle.setFont(headerFont);
        }
    }

    //body row 생성
    private void createRow(Sheet sheet, List<String> cellList, int rowNum){
        int size = cellList.size();
        Row row = sheet.createRow(rowNum);
        Cell cell = null;

        CellStyle cellStyle = workbook.createCellStyle();
        // 폰트 지정
        Font headerFont = workbook.createFont();
        headerFont.setFontName("나눔고딕");
        headerFont.setFontHeight((short)200);
        cellStyle.setFont(headerFont);

        for (int i=0; i<size; i++){
            // cell style을 적용하여 대용량 데이터 row 생성시 시간이 초과되어 제외함.
            cell = row.createCell(i);
            //data가 숫자(금액)인 경우 변환
            if (!cellList.get(i).equals("") && cellList.get(i).split("\\^").length > 1){
                cell.setCellValue(Long.parseLong(cellList.get(i).split("\\^")[0]));
                cell.setCellStyle(applyCellStyle(3, cellStyle));
            } else {
                cell.setCellValue(cellList.get(i));
                cell.setCellStyle(applyCellStyle(5, cellStyle));
            }
        }
    }


    //Footer row 생성
    private void createFooterRow(Sheet sheet, List<String> cellList, int rowNum){
        Row row = sheet.createRow(rowNum);
        Cell cell = null;

        CellStyle cellStyle = workbook.createCellStyle();
        // 폰트 지정
        Font headerFont = workbook.createFont();
        headerFont.setColor(IndexedColors.WHITE.getIndex());
        headerFont.setFontHeight((short)200);
        headerFont.setBold(true);
        cellStyle.setFont(headerFont);

        int size = cellList.size();
        for (int i=0; i<size; i++){
            cell = row.createCell(i);
            cell.setCellValue(cellList.get(i));
            if(i == 0){
                cell.setCellStyle(applyCellStyle(2, cellStyle));
            }else{
                // cell style을 적용하여 대용량 데이터 row 생성시 시간이 초과되어 제외함.
                //data가 숫자(금액)인 경우 변환
                if (!cellList.get(i).equals("") && cellList.get(i).split("\\^").length > 1){
                    cell.setCellValue(Long.parseLong(cellList.get(i).split("\\^")[0]));
                    cell.setCellStyle(applyCellStyle(4, cellStyle));
                } else {
                    cell.setCellValue(cellList.get(i));
                    cell.setCellStyle(applyCellStyle(4, cellStyle));
                }
            }
        }
    }

    //모델 객체에 담을 형태로 엑셀데이터 생성
    public static Map<String, Object> createExcelData(List<List<String>> data, List<String> header, String filename){
        Map<String, Object> excelData = new HashMap<>();
        excelData.put("filename", createFileName(filename));
        excelData.put("header", header);
        excelData.put("body", data);
        // excelData.put("body", createBodyData(data));

        return excelData;
    }


    //모델 객체에 담을 형태로 엑셀데이터 생성 (타이틀 있는 버전)
    public static Map<String, Object> createExcelData2(List<List<String>> data, List<List<String>> header, String filename){
        Map<String, Object> excelData = new HashMap<>();
        excelData.put("filename", createFileName(filename));
        excelData.put("header", header);
        excelData.put("body", data);

        return excelData;
    }


    //모델 객체에 담을 형태로 엑셀데이터 생성 (푸터 있는 버전)
    public static Map<String, Object> createExcelData3(List<List<String>> data, List<List<String>> header, List<String> footer ,String filename){
        Map<String, Object> excelData = new HashMap<>();
        excelData.put("filename", createFileName(filename));
        excelData.put("header", header);
        excelData.put("footer", footer);
        excelData.put("body", data);

        return excelData;
    }

    //@ExcelFileName로 엑셀 파일명 생성
    private static String createFileName(String fileName){
        long time = System.currentTimeMillis();
		SimpleDateFormat day = new SimpleDateFormat("yyyyMMddhhmmss");
		String excelnm = day.format(time);
        fileName = fileName+"_"+excelnm;
        return fileName;
    }

    //데이터 리스트 형태로 만들기
    // private static List<List<String>> createBodyData(List<List<String>> dataList){
    //     List<List<String>> bodyData = new ArrayList<>();
    //     dataList.forEach(r -> bodyData.add(r));
    //     return bodyData;
    // }

    /*
    * 셀 스타일 정의 후 반환
    * type : 0-header / 1-body
    */
    // private CellStyle applyCellStyle(CellStyle cellStyle, Color color) {
    private CellStyle applyCellStyle(int type, CellStyle cellStyle) {

        //type이 header일 경우에만 적용 (기본 선있는 테이블)
        if (type == 0) {
            // 테두리
            cellStyle.setBorderLeft(BorderStyle.THIN);
            cellStyle.setBorderTop(BorderStyle.THIN);
            cellStyle.setBorderRight(BorderStyle.THIN);
            cellStyle.setBorderBottom(BorderStyle.THIN);

            // 배경색 지정
            cellStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());  // 배경색
            cellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);  //채우기 적용

            // 정렬
            cellStyle.setAlignment(HorizontalAlignment.CENTER);
            cellStyle.setVerticalAlignment(VerticalAlignment.CENTER);

        }

        //type이 제목인 경우
        if(type == 1){ // (타이틀 hearder stlye)

            // 정렬
            cellStyle.setAlignment(HorizontalAlignment.LEFT);
            cellStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        }

        // border없는 header 스타일
        if(type == 2){

            // 배경색 지정
            cellStyle.setFillForegroundColor(IndexedColors.GREY_50_PERCENT.getIndex());  // 배경색
            cellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);  //채우기 적용

            // 정렬
            cellStyle.setAlignment(HorizontalAlignment.CENTER);
            cellStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        }

        //type이 숫자(금액)인 경우 콤마 적용
        if (type == 3){
            cellStyle.setDataFormat((short) 3);
        }

        // footer
        if (type == 4){
            // 배경색 지정
            cellStyle.setFillForegroundColor(IndexedColors.GREY_50_PERCENT.getIndex());  // 배경색
            cellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);  //채우기 적용

            // 정렬
            cellStyle.setAlignment(HorizontalAlignment.GENERAL);

            // 소수점
            cellStyle.setDataFormat((short) 3);
        }

        return cellStyle;
    }
}
