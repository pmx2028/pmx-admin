/**
 * This configuration was generated using the CKEditor 5 Builder. You can modify it anytime using this link:
 * https://ckeditor.com/ckeditor-5/builder/#installation/NoNgNARATAdCMEYKQOwFYoIJwGYAseOKWWADKTgBykgkKlq3ZRp5RZQhR7IQCmAO2SkwwBGBEjxUgLqQ+CACZUAhgCMIMoA=
 */

/**
 * =============================================================
 * 기사 작성 페이지외 모든 곳 (게시판, 포럼)에서 사용되는 ckeditor 설정
 * -> 이미지 업로드시 별도 db, s3에 저장되지 않음
 * =============================================================
 */
import {
    ClassicEditor, //ckeditor 빌드 유형

    // 필수 핵심 플러그인
    Essentials,
    Paragraph,
    ShiftEnter,
    Alignment,
    Autosave,

    //텍스트 서식 및 스타일링 플러그인
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Subscript,
    Superscript,
    //Code,
    //CodeBlock,
    // RemoveFormat,
    FontBackgroundColor,
    FontColor,
    // FontFamily,
    // FontSize,
    Heading,
    Highlight,
    Style,
    BlockQuote,
    Bookmark,
    HorizontalLine,
    PageBreak,

    //목록 및 들여쓰기 플러그인
    List,
    ListProperties,
    TodoList,
    Indent,
    IndentBlock,

    //이미지 및 미디어 플러그인
    AutoImage,
    ImageBlock,
    ImageCaption,
    ImageInline,
    ImageInsert,
    ImageInsertViaUrl,
    ImageResize,
    ImageStyle,
    ImageTextAlternative,
    ImageToolbar,
    ImageUpload,
    // SimpleUploadAdapter,
    MediaEmbed,

    //링크 및 특수 문자 플러그인
    AutoLink,
    Link,
    LinkImage,

    SpecialCharacters, // 커스텀 특수문자
    SpecialCharactersArrows, //화살표 기호 집합
    SpecialCharactersCurrency, //통화 기호 집합
    SpecialCharactersEssentials, //필수 특수 문자(예: 저작권, 등록 상표 기호) 집합
    SpecialCharactersLatin, //라틴어 기반 언어에서 사용되는 특수 문자 집합
    SpecialCharactersMathematical, //수학 관련 특수 문자 집합
    SpecialCharactersText, //일반 텍스트 관련 특수 문자(예: 따옴표, 대시) 집합

    //테이블 플러그인
    Table,
    TableCaption,
    TableCellProperties,
    TableColumnResize,
    TableLayout,
    TableProperties,
    TableToolbar,
    //PlainTableOutput,

    //고급 및 유틸리티 플러그인
    BalloonToolbar,
    FindAndReplace,
    // FullPage,
    Fullscreen,
    GeneralHtmlSupport,
    HtmlComment,
    HtmlEmbed,
    // Markdown,
    Mention,
    // PasteFromMarkdownExperimental,
    PasteFromOffice,
    ShowBlocks,
    //SourceEditing,
    TextTransformation,
    WordCount,
    Plugin,
    ButtonView,
    createDropdown,
    addListToDropdown,
    Collection,
    Model
} from 'ckeditor5';

import translations from 'ckeditor5/translations/ko.js'; // ko언어팩 추가
const LICENSE_KEY = 'GPL'; // or <YOUR_LICENSE_KEY>.

// 약물 특수문자를 제일 먼저 등록하기 위해 플러그인 클래스로 래핑
class QuoteEnterAsSoftBreakPlugin extends Plugin {
    afterInit() {
        const editor = this.editor;
        const enterCommand = editor.commands.get('enter');
        const shiftEnterCommand = editor.commands.get('shiftEnter');

        if (!enterCommand || !shiftEnterCommand) return;

        this.listenTo(enterCommand, 'execute', (evt) => {
            const position = editor.model.document.selection.getFirstPosition();
            const paragraph = position?.findAncestor('paragraph');
            const htmlPAttributes = paragraph?.getAttribute('htmlPAttributes');
            const classes = htmlPAttributes?.classes || [];

            if (!classes.includes('quote')) return;

            evt.stop();
            editor.execute('shiftEnter');
        }, { priority: 'high' });
    }
}

class SpecialCharactersYakMul extends Plugin {
    static get requires() { return [ SpecialCharacters ]; }
    static get pluginName() { return 'SpecialCharactersYakMul'; }

    init() {
        const specialCharacters = this.editor.plugins.get('SpecialCharacters');
        specialCharacters.addItems('약물', [
            { title: '·', character: '·' },
            { title: '“', character: '“' },
            { title: '”', character: '”' },
            { title: '‘', character: '‘' },
            { title: '’', character: '’' },
            { title: '…', character: '…' },
            { title: '①', character: '①' },
            { title: '②', character: '②' },
            { title: '③', character: '③' },
            { title: '④', character: '④' },
            { title: '⑤', character: '⑤' },
            { title: '⑥', character: '⑥' },
            { title: '⑦', character: '⑦' },
            { title: '⑧', character: '⑧' },
            { title: '⑨', character: '⑨' },
            { title: '⑩', character: '⑩' },
            { title: '⑪', character: '⑪' },
            { title: '⑫', character: '⑫' },
            { title: '⑬', character: '⑬' },
            { title: '⑭', character: '⑭' },
            { title: '⑮', character: '⑮' },
            { title: '⑯', character: '⑯' },
            { title: '⑰', character: '⑰' },
            { title: '⑱', character: '⑱' },
            { title: '⑲', character: '⑲' },
            { title: '⑳', character: '⑳' },
            { title: '㉑', character: '㉑' },
            { title: '㉒', character: '㉒' },
            { title: '㉓', character: '㉓' },
            { title: '㉔', character: '㉔' },
            { title: '㉕', character: '㉕' },
            { title: '㉖', character: '㉖' },
            { title: '㉗', character: '㉗' },
            { title: '㉘', character: '㉘' },
            { title: '㉙', character: '㉙' },
            { title: '㉚', character: '㉚' },
            { title: '㉛', character: '㉛' },
            { title: '㉜', character: '㉜' },
            { title: '㉝', character: '㉝' },
            { title: '㉞', character: '㉞' },
            { title: '㉟', character: '㉟' },
            { title: '㊱', character: '㊱' },
            { title: '㊲', character: '㊲' },
            { title: '㊳', character: '㊳' },
            { title: '㊴', character: '㊴' },
            { title: '㊵', character: '㊵' },
            { title: '㊶', character: '㊶' },
            { title: '㊷', character: '㊷' },
            { title: '㊸', character: '㊸' },
            { title: '㊹', character: '㊹' },
            { title: '㊺', character: '㊺' },
            { title: '㊻', character: '㊻' },
            { title: '㊼', character: '㊼' },
            { title: '㊽', character: '㊽' },
            { title: '㊾', character: '㊾' },
            { title: '㊿', character: '㊿' },
            { title: '㊣', character: '㊣' },
            { title: '㊤', character: '㊤' },
            { title: '㊥', character: '㊥' },
            { title: '㊦', character: '㊦' },
            { title: '㊧', character: '㊧' },
            { title: '㊨', character: '㊨' },
            { title: '▲', character: '▲' },
            { title: '▼', character: '▼' },
            { title: '◀', character: '◀' },
            { title: '▶', character: '▶' },
            { title: '△', character: '△' },
            { title: '▽', character: '▽' },
            { title: '◁', character: '◁' },
            { title: '▷', character: '▷' },
            { title: '↑', character: '↑' },
            { title: '↓', character: '↓' },
            { title: '←', character: '←' },
            { title: '→', character: '→' },
            { title: '↕', character: '↕' },
            { title: '↔', character: '↔' },
            { title: '↗', character: '↗' },
            { title: '↙', character: '↙' },
            { title: '↖', character: '↖' },
            { title: '↘', character: '↘' },
            { title: '＊', character: '＊' },
            { title: '§', character: '§' },
            { title: '※', character: '※' },
            { title: '☆', character: '☆' },
            { title: '★', character: '★' },
            { title: '○', character: '○' },
            { title: '●', character: '●' },
            { title: '◎', character: '◎' },
            { title: '◇', character: '◇' },
            { title: '◆', character: '◆' },
            { title: '□', character: '□' },
            { title: '■', character: '■' },
            { title: '♤', character: '♤' },
            { title: '♠', character: '♠' },
            { title: '♡', character: '♡' },
            { title: '♥', character: '♥' },
            { title: '♧', character: '♧' },
            { title: '♣', character: '♣' },
            { title: '⊙', character: '⊙' },
            { title: '◈', character: '◈' },
            { title: '▣', character: '▣' },
            { title: '◐', character: '◐' },
            { title: '◑', character: '◑' },
            { title: '▤', character: '▤' },
            { title: '▥', character: '▥' },
            { title: '▨', character: '▨' },
            { title: '▧', character: '▧' },
            { title: '▦', character: '▦' },
            { title: '▩', character: '▩' },
            { title: '♨', character: '♨' },
            { title: '☏', character: '☏' },
            { title: '☎', character: '☎' },
            { title: '☜', character: '☜' },
            { title: '☞', character: '☞' },
            { title: '¶', character: '¶' },
            { title: '†', character: '†' },
            { title: '‡', character: '‡' },
            { title: '♭', character: '♭' },
            { title: '♩', character: '♩' },
            { title: '♪', character: '♪' },
            { title: '♬', character: '♬' },
            { title: '㉿', character: '㉿' },
            { title: '㈜', character: '㈜' },
            { title: '™', character: '™' },
            { title: '㏂', character: '㏂' },
            { title: '㏘', character: '㏘' },
            { title: '®', character: '®' },
            { title: '［', character: '［' },
            { title: '］', character: '］' },
            { title: '⁺', character: '⁺' },
            { title: '⁻', character: '⁻' },
            { title: '㎡', character: '㎡' },
            { title: 'ft³', character: 'ft³' }
        ]);
    }
}


// 데스크탑용 툴바
export const desktopToolbar = {
    items: [
        'undo', 'redo', '|',
        'heading', 'style', '|',

        'alignment', 'bulletedList', 'numberedList', 'outdent', 'indent', '|',

        'bold', 'italic', 'underline', 'strikethrough',
        'subscript', 'superscript', 'fontColor', 'fontBackgroundColor', '|',

        'insertImage', 'mediaEmbed', 'insertTable',
        'blockQuote', 'link', 'HorizontalLine', 'specialCharacters', '|',

    ],
    shouldNotGroupWhenFull: true
};

// 모바일용 간소화된 툴바
export const mobileToolbar = {
    items: [
        'undo', 'redo', '|',
        'bold', 'italic', 'underline', 'HorizontalLine', '|',
        'insertImage', 'mediaEmbed',
    ],
    shouldNotGroupWhenFull: true // 모바일에서도 버튼이 넘치면 다음 줄로 넘어가는 것이 좋습니다.
};

// ckeditor 설정
export const editorConfig = {
    plugins: [
        // 필수 핵심 플러그인
        Essentials, //CKEditor 5의 모든 빌드에 포함되어야 하는 핵심 플러그인들의 묶음
        Paragraph, //텍스트를 단락(p)으로 편집할 수 있도록 지원
        ShiftEnter, // Shift+Enter 시 <br> 태그 삽입 (줄바꿈)
        Alignment, //텍스트, 이미지, 테이블 등의 정렬 기능
        Autosave, //에디터 내용이 자동으로 저장

        //텍스트 서식 및 스타일링 플러그인
        Bold, //텍스트를 굵게
        Italic, //텍스트를 기울임
        Underline, //텍스트에 밑줄
        Strikethrough, //텍스트에 취소선
        Subscript, //텍스트를 아래첨자 (H₂O의 ₂)
        Superscript, //텍스트를 위첨자 (x²의 ²)
        //Code, //텍스트를 인라인 코드 스타일로 적용(<code>)
        //CodeBlock, //여러 줄의 코드 블록을 삽입하고 강조
        // RemoveFormat, //선택된 텍스트에서 적용된 모든 서식을 제거
        FontBackgroundColor, //텍스트의 배경색 (형광펜 효과)을 변경
        FontColor, //텍스트의 색상을 변경

        // FontFamily, //텍스트의 글꼴(폰트) 종류를 변경
        // FontSize, //텍스트의 글꼴 크기를 변경

        Heading, //단락 및 다양한 레벨의 제목(<h1>~<h6>)을 적용
        Highlight, // 텍스트에 형광펜 강조 효과를 적용
        Style, //사용자 정의 CSS 스타일을 콘텐츠에 적용
        BlockQuote,//인용구(<blockquote>)를 삽입
        Bookmark, //문서 내에 북마크(앵커)를 삽입하여 특정 위치로 이동
        HorizontalLine, //문서에 수평선(hr 태그)을 삽입
        PageBreak, //문서에 페이지 나누기(page-break-after)삽입 - 주로 인쇄용

        //목록 및 들여쓰기 플러그인
        List, //글머리 기호 목록(<ul>)과 숫자 목록(<ol>)을 생성
        ListProperties, //목록의 고급 속성(예: 목록 스타일, 시작 번호)을 제어
        TodoList, //할 일 목록(체크박스)을 생성
        Indent, //선택된 단락이나 목록 항목의 들여쓰기를 늘리거나 줄이는 기능
        IndentBlock, //블록 요소(예: 단락, 블록 인용구)의 들여쓰기를 조절

        //이미지 및 미디어 플러그인
        AutoImage, //붙여넣은 이미지 URL을 자동으로 이미지로 변환, 드래그 앤 드롭한 이미지를 처리
        ImageBlock, //이미지를 단락과 분리된 독립적인 블록 요소로 처리
        ImageCaption, //이미지에 **캡션(설명)**을 추가
        ImageInline, //이미지를 텍스트 흐름에 따라 인라인 요소로 삽입
        ImageInsert, //로컬 컴퓨터에서 이미지를 업로드하거나, URL을 통해 이미지를 삽입 할 통합된 인터페이스를 제공
        ImageInsertViaUrl, //이미지 URL을 직접 입력하여 이미지를 삽입하는 기능을 명시적으로 제공
        ImageResize, //에디터 내에서 이미지 크기를 조절할 수 있는 핸들을 제공
        ImageStyle, //이미지의 스타일 (예: 인라인, 텍스트 감싸기, 중앙 정렬 등)을 변경하는 기능
        ImageTextAlternative, //이미지에 **대체 텍스트(alt text)**를 추가
        ImageToolbar, //이미지를 선택했을 때 나타나는 컨텍스트 툴바의 기능을 정의
        ImageUpload, //이미지 업로드 메커니즘을 처리하는 기본 플러그인
        // SimpleUploadAdapter, //이미지 업로드를 위한 간단한 어댑터 -  서버와 연동하여 이미지를 처리할 때 사용
        MediaEmbed, //미디어 플랫폼의 URL을 통해 동영상을 삽입

        //링크 및 특수 문자 플러그인
        AutoLink, //입력하는 동안 URL을 자동으로 하이퍼링크로 변환
        Link, //선택된 텍스트에 하이퍼링크를 삽
        LinkImage, //이미지에 하이퍼링크를 추가
        SpecialCharacters, //키보드로 입력하기 어려운 특수 문자를 삽입
        SpecialCharactersYakMul,
        SpecialCharactersArrows, //화살표 기호 집합
        SpecialCharactersCurrency, //통화 기호 집합
        SpecialCharactersEssentials, //필수 특수 문자(예: 저작권, 등록 상표 기호) 집합
        SpecialCharactersLatin, //라틴어 기반 언어에서 사용되는 특수 문자 집합
        SpecialCharactersMathematical, //수학 관련 특수 문자 집합
        SpecialCharactersText, //일반 텍스트 관련 특수 문자(예: 따옴표, 대시) 집합

        //테이블 플러그인
        Table, //기본적인 테이블(<table>) 삽입 및 편집 기능
        TableCaption, //테이블에 **캡션(설명)**을 추가
        TableCellProperties, //테이블 셀의 속성 (예: 배경색, 테두리)을 편집
        TableColumnResize, //테이블 열의 크기를 마우스로 조절
        TableLayout, //테이블 레이아웃을 제어하는 기능
        TableProperties, //테이블 전체의 속성 (예: 너비, 정렬)을 편집
        TableToolbar, //테이블을 선택했을 때 나타나는 컨텍스트 툴바의 기능을 정의
        //PlainTableOutput, //테이블의 HTML 출력을 더 단순화하는 데 사용 - 사용자 정의 빌드 시 특정 요구사항에 따라 달라질 수 있음

        //고급 및 유틸리티 플러그인
        BalloonToolbar, //텍스트를 선택했을 때 나타나는 플로팅 툴바
        FindAndReplace, //에디터 내용 내에서 텍스트를 찾고 바꾸는 기능
        // FullPage, //문서 전체를 에디터가 제어하도록 하는 플러그인 - <html>, <head>, <body> 태그를 포함한 완전한 HTML 문서를 편집할 때 사용
        Fullscreen, //에디터를 전체 화면 모드로 전환
        GeneralHtmlSupport, //CKEditor 5의 기본 스키마에 정의되지 않은 임의의 HTML 요소를 에디터에서 지원하고 렌더링 - 보안에 주의 필요
        HtmlComment, //HTML 주석을 에디터 내에서 보고 편집 - 개발자용
        HtmlEmbed, //HTML 코드 스니펫을 에디터 내용에 직접 삽입하고 미리 보기
        // Markdown, //마크다운 문법을 사용하여 콘텐츠를 편집할 수 있도록 마크다운-HTML 간 변환 기능을 제공  -> 해당 플러그인이 데이터 프로세서를 마크다운으로 바꿔서 getData() 결과가 태그 없이 나옴
        Mention, //@ 기호를 사용하여 사용자를 멘션하는 등의 기능을 구현할 수 있는 기반을 제공
        // PasteFromMarkdownExperimental, //마크다운 형식을 붙여넣을 때 마크다운 구문을 해석하여 서식을 적용 - 베타버전
        PasteFromOffice, //Microsoft Word, Excel 등 오피스 문서에서 복사한 내용을 붙여넣을 때 서식을 최대한 유지
        ShowBlocks, //문서 내의 HTML 블록 요소의 경계를 시각적으로 표시
        //SourceEditing, //에디터의 HTML 소스 코드를 직접 편집 - 개발자나 고급 사용자
        TextTransformation, //특정 텍스트 패턴을 자동으로 변환하는 기능 ((c)를 ©)
        WordCount, //에디터 내용의 단어 수와 문자 수를 계산하여 표시
    ],
    //BalloonToolbar 플러그인이 활성화- 플로팅툴바 버튼 정의
    balloonToolbar: [
        'bold', 'italic', 'underline', 'strikethrough', 'fontColor', 'fontBackgroundColor', 'link', '|',
        'alignment', 'bulletedList', 'numberedList'
    ],
    //에디터 폰트 설정
    fontFamily: {
        options: ['Noto Sans KR'],
        supportAllValues: false // false - options에 폰트는 무시 - 에디터 내 일관성 유지
    },
    // fontSize: {
    //     options: [14, 16, 'default', 20, 22],
    //     supportAllValues: false
    // },
    fullscreen: {
        onEnterCallback: container =>
            container.classList.add(
                'editor-container',
                'editor-container_classic-editor',
                'editor-container_include-style',
                'editor-container_include-word-count',
                'editor-container_include-fullscreen',
                'main-container'
            )
    },
    heading: {
        options: [
            {model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph'},
            {model: 'heading1', view: 'h1', title: '머리글 #1', class: 'ck-heading_heading1'},
            {model: 'heading2', view: 'h2', title: '머리글 #2', class: 'ck-heading_heading2'},
            {model: 'heading3', view: 'h3', title: '머리글 #3', class: 'ck-heading_heading3'},
        ]
    },
    // 스타일 설정
    style: {
        definitions: [
            {name: '본문', element: 'p', classes: ['reset'],},
            {name: '편주', element: 'p', classes: ['quote']},
        ]
    },    
    // 디버킹 유효성
    htmlSupport: {
        // ✅ 허용 태그 & 속성(화이트리스트)
        allow: [
            // 텍스트/단락
            { name: 'p', attributes: ['class'], classes: ['table-title', 'table-txt', 'mid-title-input-box'] },
            { name: 'br' },
            { name: 'div', attributes: ['class'], classes: true },
            { name: 'span', attributes: ['class'], classes: true },     // 인라인 강조용 class만 허용
            { name: 'strong' },
            { name: 'em' },
            { name: 'u' },
            { name: 's' },
            { name: 'sub' },
            { name: 'sup' },
            { name: 'blockquote' },

            // 제목(Heading 플러그인 쓰면)
            { name: 'h1' }, { name: 'h2' }, { name: 'h3' },

            // 링크
            { name: 'a', attributes: ['href','target','rel'] },

            // 목록
            { name: 'ul' }, { name: 'ol' }, { name: 'li' },
            { name: 'hr', attributes: ['class'], classes: ['hr-thin', 'hr-thick', 'hr-thin-dashed', 'hr-thick-dashed', 'hr-thin-gradient', 'hr-thick-gradient']},

            // 이미지(업로더/리사이즈 플러그인 고려, 꼭 필요한 속성만)
            { name: 'img', attributes: ['src','alt','width','height','id','data-image','class','data-id','data-key', 'data-role', 'data-infographic-code'] },

            // 테이블
            { name: 'table', attributes: ['class','border','cellpadding','cellspacing'], classes: ['stock_table','stock_table2'] },
            { name: 'thead', attributes: ['class'], classes: true },
            { name: 'tbody', attributes: ['class'], classes: true },
            { name: 'tr',    attributes: ['class'], classes: true },
            { name: 'th',    attributes: ['class','rowspan','colspan','scope'], classes: true },
            { name: 'td',    attributes: ['class','rowspan','colspan','headers'], classes: true },
            { name: 'figcaption' },
            {
                name: 'div',
                classes: [ 'ck-media__wrapper', 'ck-media__wrapper__poster' ], // 에디터 내부 클래스 허용
                styles: true,
                attributes: true
            },
            {
                name: 'iframe',
                attributes: [
                    'src', 'style', 'frameborder', 'allow', 'allowfullscreen',
                    'width', 'height', 'title'
                ],
                classes: true,
                styles: true
            },
            // 기존 migration 데이터에 어떤 class가 들어올지 몰라서 일단 true로 변경
            { name: 'figure', attributes: true, classes: true },

        ],

        // ❌ 전역 차단(allow에 있더라도 우선 적용)
        disallow: [
            { name: /.*/, attributes: ['style'] },    // 모든 태그의 inline style 속성 전역 차단
            { name: /.*/, styles: true },
            //{ name: /.*/, attributes: [/^data-/] },   // data-* 속성 전부 차단 (data-start 등)
            // 안전망: 특정 태그의 개별 CSS 프로퍼티까지 차단
            { name: 'p',    styles: [ /.*/ ] },
            { name: 'span', styles: [ /.*/ ] },
            { name: 'div',  styles: [ /.*/ ] },
            { name: 'table',styles: [ /.*/ ] },
            { name: 'th',   styles: [ /.*/ ] },
            { name: 'td',   styles: [ /.*/ ] },
            //{ name: 'img',  styles: [ /.*/ ] }
        ]
        // allow: [
        //     { name: 'table', attributes: true, classes: ['stock_table', 'stock_table2'],  }, // 'style' 속성도 허용
        //     { name: 'thead', attributes: true, classes: true},
        //     { name: 'tbody', attributes: true, classes: true},
        //     { name: 'tr', attributes: true, classes: true},
        //     { name: 'th', attributes: true, classes: true,}, // th 태그 포함
        //     { name: 'td', attributes: true, classes: true},
        //     { name: 'br', attributes: true, classes: true }, // <br> 태그 허용 (줄바꿈 유지)
        //     { name: 'p', attributes: ['class'], classes: ['table-title', 'table-txt']},
        //     { name: 'div', attributes: true, classes: true }
        // ]
        // // disallow: [] // 특정 태그를 명시적으로 차단할 필요가 있다면 사용
    },
    image: {
        toolbar: [
            'toggleImageCaption',
            'imageTextAlternative',
            'linkImage',
            '|',
            'imageStyle:inline',
            'imageStyle:wrapText',
            'imageStyle:breakText',
            '|',
            'resizeImage'
        ]
        //insert: { integrations: [ 'insertImageViaUrl' ] }
    },

    licenseKey: LICENSE_KEY,
    link: {
        addTargetToExternalLinks: true,
        defaultProtocol: 'https://',
        decorators: {
            toggleDownloadable: {
                mode: 'manual',
                label: 'Downloadable',
                attributes: {
                    download: 'file'
                }
            }
        }
    },
    list: {
        properties: {
            styles: true,
            startIndex: true,
            reversed: true
        }
    },
    mention: {
        feeds: [
            {
                marker: '@',
                feed: []
            }
        ]
    },
    menuBar: {
        isVisible: false // 툴바 위에 [수정, 보기, 삽입, 서식, 도움말] 부분 안나오도록 false 설정
    },
    placeholder: '내용을 입력하세요.',
    table: {
		contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
	},
    translations: [translations]
};

// ------------------------------------------------------------------------------------------------------------------------------------------//
let mainEditorInstance = null; // 초기화 전 null로 설정

// 에디터를 생성하는 함수
function isQuoteParagraph(node) {
    if (!node?.is?.('element', 'paragraph')) return false;

    const htmlPAttributes = node.getAttribute('htmlPAttributes');
    const classes = htmlPAttributes?.classes || [];

    return classes.includes('quote');
}

function getQuoteEscapeContext(editor) {
    const position = editor.model.document.selection.getFirstPosition();
    const paragraph = position?.findAncestor('paragraph') || null;
    const blockQuote = position?.findAncestor('blockQuote') || null;

    if (blockQuote) {
        return {
            container: blockQuote,
            paragraph
        };
    }

    if (isQuoteParagraph(paragraph)) {
        return {
            container: paragraph,
            paragraph
        };
    }

    return null;
}

function isSelectionAtEscapeTargetEnd(editor, context) {
    const selection = editor.model.document.selection;
    const position = selection.getFirstPosition();

    if (!selection.isCollapsed || !position || !context?.paragraph) return false;

    if (context.container?.is?.('element', 'blockQuote')) {
        if (context.paragraph !== context.container.getChild(context.container.childCount - 1)) {
            return false;
        }
    }

    const endPosition = editor.model.createPositionAt(context.paragraph, 'end');
    return position.isEqual(endPosition);
}

function moveSelectionToParagraphAfter(editor, targetNode) {
    if (!targetNode?.parent) return false;

    let didMove = false;

    editor.model.change(writer => {
        let targetParagraph = targetNode.nextSibling;

        if (!targetParagraph?.is?.('element', 'paragraph') || isQuoteParagraph(targetParagraph)) {
            targetParagraph = writer.createElement('paragraph');
            writer.insert(targetParagraph, writer.createPositionAfter(targetNode));
        }

        writer.setSelection(targetParagraph, 0);
        didMove = true;
    });

    if (didMove) {
        editor.editing.view.focus();
    }

    return didMove;
}

function installQuoteEscapeHandler(editor) {
    const editableElement = editor.ui.getEditableElement?.() || editor.ui.view.element?.querySelector('.ck-editor__editable');
    if (!editableElement || editor._quoteEscapeHandlerInstalled) return;

    const moveOutOfTrailingQuoteBlock = () => {
        const context = getQuoteEscapeContext(editor);

        if (!context?.container || context.container.nextSibling) return false;

        return moveSelectionToParagraphAfter(editor, context.container);
    };

    const handleKeyDown = (event) => {
        if (event.key !== 'ArrowDown') return;

        const context = getQuoteEscapeContext(editor);

        if (!context?.container || context.container.nextSibling) return;
        if (!isSelectionAtEscapeTargetEnd(editor, context)) return;

        event.preventDefault();
        moveSelectionToParagraphAfter(editor, context.container);
    };

    const handleMouseDown = (event) => {
        if (event.target !== editableElement) return;
        if (!moveOutOfTrailingQuoteBlock()) return;

        event.preventDefault();
    };

    editableElement.addEventListener('keydown', handleKeyDown);
    editableElement.addEventListener('mousedown', handleMouseDown);
    editor._quoteEscapeHandlerInstalled = true;

    editor.once('destroy', () => {
        editableElement.removeEventListener('keydown', handleKeyDown);
        editableElement.removeEventListener('mousedown', handleMouseDown);
        editor._quoteEscapeHandlerInstalled = false;
    });
}

function createEditor(element, isMobile) {

    const finalConfig = {
        ...editorConfig,
        plugins: [...editorConfig.plugins, QuoteEnterAsSoftBreakPlugin],
        toolbar: isMobile ? mobileToolbar : desktopToolbar,
        menuBar: {
            isVisible: false
        },
        mediaEmbed: {
            previewsInData: true,
            elementName: 'div',
            providers: [
                // YouTube (기본 provider 유지)
                {
                    name: 'youtube',
                    url: [
                        // watch
                        /^(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?v=([\w-]+)/,

                        // shorts
                        /^(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/shorts\/([\w-]+)/,

                        // live
                        /^(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/live\/([\w-]+)/,

                        // embed
                        /^(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/embed\/([\w-]+)/,

                        // youtu.be
                        /^(?:https?:\/\/)?youtu\.be\/([\w-]+)/,

                        // legacy /v/
                        /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([\w-]+)/
                    ],
                    html: match => {
                        const id = match[1];
                        return (
                            '<div style="position: relative; padding-bottom: 56.25%; height: 0;">' +
                            `<iframe src="https://www.youtube.com/embed/${id}" ` +
                            'style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" ' +
                            'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
                            '</iframe>' +
                            '</div>'
                        );
                    }
                },
                // Instagram 추가
                {
                    name: 'instagram',
                    url: [
                        /^https?:\/\/(?:www\.)?instagram\.com\/p\/([\w-]+)/,
                        /^https?:\/\/(?:www\.)?instagram\.com\/reel\/([\w-]+)/,
                        /^https?:\/\/(?:www\.)?instagram\.com\/tv\/([\w-]+)/
                    ],
                    html: match => {
                        const id = match[1];
                        return (
                            '<div style="position: relative; padding-bottom: 125%; height: 0; max-width: 540px; margin: 0 auto;">' +
                            `<iframe src="https://www.instagram.com/p/${id}/embed" ` +
                            'style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" ' +
                            'frameborder="0" scrolling="no" allowtransparency="true">' +
                            '</iframe>' +
                            '</div>'
                        );
                    }
                }
            ]
        }
    };

    return ClassicEditor.create(element, finalConfig)
        .then(editor => {
            mainEditorInstance = editor;
            window.mainEditor = editor;
            const csrfHeaders = getCsrfHeaders();
            editor.plugins.get('FileRepository').createUploadAdapter = (loader) =>
                new ClipUploadAdapter(loader, '/api/clip/upload', { csrfHeaders });

            // 스타일 태그 제거
            stripInlineStylesOnPaste(editor);
            installQuoteEscapeHandler(editor);

            // 외부 이미지 URL 붙여넣기 시 바로 삽입 (업로드 없이)
            installExternalImageDirectInsert(editor);

            // 워드 카운트 플러그인 통합
            const wordCountContainer = document.querySelector('#editor-word-count');
            if (wordCountContainer && editor.plugins.has('WordCount')) {
                // 기존 워드 카운트 요소가 있으면 제거
                while (wordCountContainer.firstChild) {
                    wordCountContainer.removeChild(wordCountContainer.firstChild);
                }
                wordCountContainer.appendChild(editor.plugins.get('WordCount').wordCountContainer);
            }

            return editor;
        })
        .catch(error => {
            console.error('[Main Editor] Initialization failed:', error);
        });
}

//메인 CKEditor 5 인스턴스를 설정하고 관리
document.addEventListener('DOMContentLoaded', () => {
    const editorTarget = document.querySelector('#editor');
    if (!editorTarget) {
        console.error('[Main Editor] #editor element not found.');
        return;
    }

    // 미디어 쿼리를 정의합니다.
    const mobileMediaQuery = window.matchMedia('(max-width: 768px)');

    // 초기 로드 시 에디터를 생성
    createEditor(editorTarget, mobileMediaQuery.matches);

    // 미디어 쿼리 상태가 변경될 때마다 이벤트
    mobileMediaQuery.addEventListener('change', (e) => {
        // 기존 에디터 인스턴스가 존재하면 삭제
        if (mainEditorInstance) {
            console.log('[Main Editor] Screen size changed. Destroying current editor.');
            mainEditorInstance.destroy()
                .then(() => {
                    console.log('[Main Editor] Re-creating editor with new toolbar.');
                    createEditor(editorTarget, e.matches);
                })
                .catch(error => {
                    console.error('[Main Editor] Failed to destroy the editor:', error);
                });
        }
    });
});

function installExternalImageDirectInsert(editor) {
    const clipboard = editor.plugins.get('ClipboardPipeline');

    clipboard.on('inputTransformation', (evt, data) => {
        const html = data.dataTransfer?.getData('text/html') || '';
        if (!html) return;

        const images = extractExternalImages(html);
        if (!images.length) return;

        // 에디터에 들어갈 콘텐츠에서 외부 이미지 제거 (이진 데이터 업로드 방지)
        data.content = editor.data.processor.toView('');

        for (const image of images) {
            editor.execute('insertImage', { source: [{ src: image.src, alt: image.alt }] });
        }
    }, { priority: 'high' });
}

function extractExternalImages(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const images = [];

    doc.querySelectorAll('img[src]').forEach(img => {
        const src = img.getAttribute('src') || '';
        if (/^https?:\/\//i.test(src)) {
            images.push({ src, alt: img.getAttribute('alt') || '' });
        }
    });

    return images;
}

function stripInlineStylesOnPaste(editor) {
    const clipboard = editor.plugins.get('ClipboardPipeline');

    clipboard.on('inputTransformation', (evt, data) => {
        const view = editor.editing.view;
        const walker = view.createRangeIn( data.content ).getWalker();

        view.change(writer => {
            for (const { item } of walker) {
                if (item.is('element')) {
                    // 1) style 속성 자체 제거
                    if (item.hasAttribute('style')) {
                        writer.removeAttribute('style', item);
                    }
                    // 2) 인라인 CSS가 남았을 가능성까지 방지 (일부 브라우저/오피스 소스)
                    // CKEditor5에서는 styles는 attribute 형태이므로 위 한 줄이면 충분하지만
                    // 안전빵으로 동일 탐색을 계속
                }
            }
        });
    });
}

function getCsrfHeaders() {
    const metaToken = document.querySelector("meta[name='_csrf']");
    const metaHeader = document.querySelector("meta[name='_csrf_header']");
    if (metaToken && metaHeader) {
        return { [metaHeader.getAttribute('content')]: metaToken.getAttribute('content') };
    }

    const cookie = document.cookie.split('; ').find((row) => row.startsWith('XSRF-TOKEN='));
    if (cookie) {
        return { 'X-CSRF-TOKEN': decodeURIComponent(cookie.split('=')[1]) };
    }

    return {};
}

function getUploadErrorMessage(error, fallback = '이미지 업로드에 실패했습니다.') {
    if (!error) return fallback;
    if (typeof error === 'string') return error;
    return error.message || fallback;
}

function throwIfUploadResponseFailed(res, json, fallbackMessage = null) {
    const message = json?.message || json?.error?.message || fallbackMessage || `HTTP ${res.status}`;
    if (!res.ok || json?.success === false) {
        throw new Error(message);
    }
}

function extractClipPayload(json) {
    return json?.data || json || null;
}

class ClipUploadAdapter {
    constructor(loader, uploadUrl, opts = {}) {
        this.loader = loader;
        this.uploadUrl = uploadUrl;
        this.csrfHeaders = opts.csrfHeaders || {};
        this.controller = new AbortController();
    }

    async upload() {
        const file = await this.loader.file;
        const form = new FormData();
        form.append('upload', file);

        try {
            const res = await fetch(this.uploadUrl, {
                method: 'POST',
                credentials: 'include',
                headers: this.csrfHeaders,
                body: form,
                signal: this.controller.signal
            });

            let json = null;
            try { json = await res.json(); } catch {}

            throwIfUploadResponseFailed(res, json);

            const clip = extractClipPayload(json);
            const url = clip?.url;
            if (!url) {
                throw new Error('업로드 응답에 이미지 URL 정보가 없습니다.');
            }

            return { default: url };
        } catch (error) {
            window.alert(getUploadErrorMessage(error));
            throw error;
        }
    }

    abort() {
        this.controller.abort();
    }
}




