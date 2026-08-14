/**
 * This configuration was generated using the CKEditor 5 Builder. You can modify it anytime using this link:
 * https://ckeditor.com/ckeditor-5/builder/#installation/NoNgNARATAdCMEYKQOwFYoIJwGYAseOKWWADKTgBykgkKlq3ZRp5RZQhR7IQCmAO2SkwwBGBEjxUgLqQ+CACZUAhgCMIMoA=
 */

/**
 * ======================================================
 * 기사 작성 페이지에서 사용되는 기사 전용 ckeditor
 * -> 이미지 업로드시 photo에 사진 저장됨
 * ======================================================
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
    SimpleUploadAdapter,
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

// 템플릿 삽입 커스텀 플러그인
class InsertCustomTemplateDropdownPlugin extends Plugin {
    init() {
        const editor = this.editor;
        const icon = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 3h10v11H3V3zm12 0h6v5h-6V3zm0 7h6v11h-6V10zM3 16h10v5H3v-5z"/></svg>';

        editor.ui.componentFactory.add('insertCustomTemplate', locale => {
            const dropdownView = createDropdown(locale);
            dropdownView.buttonView.set({
                label: 'Template',
                icon,
                tooltip: true
            });

            const options = [
                { label: 'Balance Sheet', value: 'type1' },
                { label: '재무상태', value: 'type2' },
                { label: '중간 제목 입력 상자', value: 'type3' }
            ];

            this.listenTo(dropdownView, 'change:isOpen', (evt, name, isOpen) => {
                if (!isOpen) return;
                const panelEl = dropdownView.panelView.element;
                if (!panelEl) return;

                panelEl.innerHTML = '';

                const wrapper = document.createElement('div');
                wrapper.className = 'ck ck-reset_all';
                wrapper.style.minWidth = '190px';
                wrapper.style.padding = '4px';

                options.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'ck ck-button ck-off';
                    btn.style.display = 'block';
                    btn.style.width = '100%';
                    btn.style.textAlign = 'left';
                    btn.textContent = opt.label;
                    btn.addEventListener('click', () => {
                        insertTableTemplate(editor, opt.value);
                        dropdownView.isOpen = false;
                    });
                    wrapper.appendChild(btn);
                });

                panelEl.appendChild(wrapper);
            });

            return dropdownView;
        });
    }
}

function parseTableTemplateHtml(templateHtml) {
    const doc = new DOMParser().parseFromString(templateHtml, 'text/html');
    const tableElement = doc.querySelector('table');

    if (!tableElement) return null;

    const rowElements = Array.from(tableElement.querySelectorAll('tr'));
    if (!rowElements.length) return null;

    const occupied = [];
    const cells = [];
    let columnCount = 0;

    rowElements.forEach((rowElement, rowIndex) => {
        let columnIndex = 0;
        const rowCells = Array.from(rowElement.children).filter((cell) => cell.tagName === 'TH' || cell.tagName === 'TD');

        rowCells.forEach((cellElement) => {
            occupied[rowIndex] = occupied[rowIndex] || [];

            while (occupied[rowIndex][columnIndex]) {
                columnIndex++;
            }

            const rowspan = Math.max(1, Number.parseInt(cellElement.getAttribute('rowspan') || '1', 10) || 1);
            const colspan = Math.max(1, Number.parseInt(cellElement.getAttribute('colspan') || '1', 10) || 1);
            const text = (cellElement.textContent || '').trim();

            cells.push({
                row: rowIndex,
                col: columnIndex,
                rowspan,
                colspan,
                text
            });

            for (let r = rowIndex; r < rowIndex + rowspan; r++) {
                occupied[r] = occupied[r] || [];
                for (let c = columnIndex; c < columnIndex + colspan; c++) {
                    occupied[r][c] = true;
                }
            }

            columnIndex += colspan;
        });

        columnCount = Math.max(columnCount, occupied[rowIndex]?.length || 0);
    });

    const rowCount = occupied.length;
    if (!rowCount || !columnCount) return null;

    let headingRows = tableElement.querySelectorAll('thead tr').length;
    if (!headingRows) {
        for (const rowElement of rowElements) {
            const rowCells = Array.from(rowElement.children).filter((cell) => cell.tagName === 'TH' || cell.tagName === 'TD');
            const isHeadingRow = rowCells.length > 0 && rowCells.every((cell) => cell.tagName === 'TH');
            if (!isHeadingRow) break;
            headingRows++;
        }
    }

    const classes = Array.from(tableElement.classList).filter(Boolean);
    const attributes = {};

    for (const attr of Array.from(tableElement.attributes)) {
        if (attr.name === 'class' || attr.name === 'style') continue;
        if (!['border', 'cellpadding', 'cellspacing'].includes(attr.name)) continue;
        attributes[attr.name] = attr.value;
    }

    const htmlTableAttributes = {};
    if (classes.length) htmlTableAttributes.classes = classes;
    if (Object.keys(attributes).length) htmlTableAttributes.attributes = attributes;

    const titleText = (doc.querySelector('p.table-title')?.textContent || '').trim();
    const descriptionText = (doc.querySelector('p.table-txt')?.textContent || '').trim();

    return {
        rowCount,
        columnCount,
        headingRows,
        cells,
        titleText,
        descriptionText,
        htmlTableAttributes: Object.keys(htmlTableAttributes).length ? htmlTableAttributes : null
    };
}

function insertParsedTableTemplate(editor, parsedTemplate) {
    editor.model.change((writer) => {
        const fragment = writer.createDocumentFragment();

        const spacingBefore = writer.createElement('paragraph');
        writer.append(spacingBefore, fragment);

        if (parsedTemplate.titleText) {
            const titleParagraph = writer.createElement('paragraph');
            writer.setAttribute('htmlPAttributes', { classes: ['table-title'] }, titleParagraph);
            writer.insertText(parsedTemplate.titleText, titleParagraph, 0);
            writer.append(titleParagraph, fragment);
        }

        if (parsedTemplate.descriptionText) {
            const descParagraph = writer.createElement('paragraph');
            writer.setAttribute('htmlPAttributes', { classes: ['table-txt'] }, descParagraph);
            writer.insertText(parsedTemplate.descriptionText, descParagraph, 0);
            writer.append(descParagraph, fragment);
        }

        const table = writer.createElement('table');

        if (parsedTemplate.headingRows > 0) {
            writer.setAttribute('headingRows', parsedTemplate.headingRows, table);
        }

        if (parsedTemplate.htmlTableAttributes) {
            writer.setAttribute('htmlTableAttributes', parsedTemplate.htmlTableAttributes, table);
        }

        const cellMatrix = [];

        for (let rowIndex = 0; rowIndex < parsedTemplate.rowCount; rowIndex++) {
            const tableRow = writer.createElement('tableRow');
            writer.append(tableRow, table);

            const rowCells = [];
            for (let colIndex = 0; colIndex < parsedTemplate.columnCount; colIndex++) {
                const tableCell = writer.createElement('tableCell');
                const paragraph = writer.createElement('paragraph');
                writer.append(paragraph, tableCell);
                writer.append(tableCell, tableRow);
                rowCells.push(tableCell);
            }

            cellMatrix.push(rowCells);
        }

        for (const cellInfo of parsedTemplate.cells) {
            const tableCell = cellMatrix[cellInfo.row]?.[cellInfo.col];
            if (!tableCell) continue;

            const paragraph = tableCell.getChild(0);
            if (paragraph && paragraph.is('element', 'paragraph') && cellInfo.text) {
                writer.insertText(cellInfo.text, paragraph, 0);
            }
        }

        for (const cellInfo of parsedTemplate.cells) {
            if (cellInfo.rowspan <= 1 && cellInfo.colspan <= 1) continue;

            const topCell = cellMatrix[cellInfo.row]?.[cellInfo.col];
            if (!topCell) continue;

            if (cellInfo.rowspan > 1) {
                writer.setAttribute('rowspan', cellInfo.rowspan, topCell);
            }
            if (cellInfo.colspan > 1) {
                writer.setAttribute('colspan', cellInfo.colspan, topCell);
            }

            for (let r = cellInfo.row; r < cellInfo.row + cellInfo.rowspan; r++) {
                for (let c = cellInfo.col; c < cellInfo.col + cellInfo.colspan; c++) {
                    if (r === cellInfo.row && c === cellInfo.col) continue;

                    const coveredCell = cellMatrix[r]?.[c];
                    if (!coveredCell || !coveredCell.parent) continue;
                    writer.remove(coveredCell);
                }
            }
        }

        writer.append(table, fragment);

        const spacingAfter = writer.createElement('paragraph');
        writer.append(spacingAfter, fragment);

        editor.model.insertContent(fragment, editor.model.document.selection);

        const firstCell = table.getChild(0)?.getChild(0);
        if (firstCell) {
            writer.setSelection(firstCell, 0);
        }
    });
}

export function insertHtmlTableAsPluginTable(editor, html) {
    if (!editor || !html) return false;

    const parsedTemplate = parseTableTemplateHtml(html);
    if (!parsedTemplate) return false;

    insertParsedTableTemplate(editor, parsedTemplate);
    return true;
}

function insertTableTemplate(editor, templateName) {
    const templates = {
        type1: `
            <p></p>
            <p class="table-title">Balance Sheet</p>
            <p class="table-txt">(단위: 억원)</p>
            <table class="table" role="presentation">
                <thead>
                    <tr>
                        <th>구분</th>
                        <th>항목</th>
                        <th>yyyy년</th>
                        <th>yyyy년</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td rowspan="2">자산</td>
                        <td>유동자산</td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>재고자산</td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td rowspan="3">부채</td>
                        <td>유동부채</td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>비유동부채</td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>순부채</td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td rowspan="2">자본</td>
                        <td>자본금</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>이익잉여금</td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
            <p></p>
        `,
        type2: `
            <p></p>
            <p class="table-title">Financial Statement</p>
            <p class="table-txt">(단위: 억원,%)</p>
            <table class="table stock_table" role="presentation">
                <thead>
                    <tr>
                        <th></th>
                        <th>yyyy년</th>
                        <th>yyyy년</th>
                        <th>증감(%)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>매출액</td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>당기순이익</td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>OCF</td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>ROI(%)</td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
            <p></p>
        `,
        type3: `
            <p class="mid-title-input-box">중간 제목 입력 상자 내용을 입력하세요.</p>
            <p></p>
        `
    };

    const html = templates[templateName];
    if (!html) return;

    if (templateName === 'type1' || templateName === 'type2') {
        if (insertHtmlTableAsPluginTable(editor, html)) {
            return;
        }
    }

    const viewFragment = editor.data.processor.toView(html);
    const modelFragment = editor.data.toModel(viewFragment);

    editor.model.change(() => {
        editor.model.insertContent(modelFragment, editor.model.document.selection);
    });
}

// 구분선 삽입 커스텀 플러그인
class InsertCustomHrDropdownPlugin extends Plugin {
    init() {
        const editor = this.editor;
        const icon = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

        editor.ui.componentFactory.add('insertCustomHorizontalLine', locale => {
            const dropdownView = createDropdown(locale);
            dropdownView.buttonView.set({
                label: 'HR',
                icon,
                tooltip: true
            });

            const options = [
                { label: '얇은 실선', value: 'hr-thin' },
                { label: '굵은 실선', value: 'hr-thick' },
                { label: '얇은 점선', value: 'hr-thin-dashed' },
                { label: '굵은 점선', value: 'hr-thick-dashed' },
                { label: '얇은 그라데이션', value: 'hr-thin-gradient' },
                { label: '굵은 그라데이션', value: 'hr-thick-gradient' }
            ];

            this.listenTo(dropdownView, 'change:isOpen', (evt, name, isOpen) => {
                if (!isOpen) return;
                const panelEl = dropdownView.panelView.element;
                if (!panelEl) return;

                panelEl.innerHTML = '';

                const wrapper = document.createElement('div');
                wrapper.className = 'ck ck-reset_all';
                wrapper.style.minWidth = '180px';
                wrapper.style.padding = '4px';

                options.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'ck ck-button ck-off';
                    btn.style.display = 'block';
                    btn.style.width = '100%';
                    btn.style.textAlign = 'left';
                    btn.textContent = opt.label;
                    btn.addEventListener('click', () => {
                        insertCustomHrTemplate(editor, opt.value);
                        dropdownView.isOpen = false;
                    });
                    wrapper.appendChild(btn);
                });

                panelEl.appendChild(wrapper);
            });

            return dropdownView;
        });
    }
}

function insertCustomHrTemplate(editor, hrClass) {
    if (!hrClass) return;

    const html = `<hr class="${hrClass}"><p></p>`;
    const viewFragment = editor.data.processor.toView(html);
    const modelFragment = editor.data.toModel(viewFragment);

    editor.model.change(() => {
        editor.model.insertContent(modelFragment, editor.model.document.selection);
    });
}


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

// 약물 특수문자를 제일 먼저 등록하기 위해 플러그인 클래스로 래핑
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

function installSpecialCharacterTargetRouter(editor) {
    if (editor._specialCharacterTargetRouterInstalled) return;

    const externalTargets = [
        document.getElementById('article_title'),
        document.getElementById('article_sub_title')
    ].filter(Boolean);
    const editableElement = editor.ui.getEditableElement();
    const insertTextCommand = editor.commands.get('insertText');
    const dialog = editor.plugins.get('Dialog');

    if (!editableElement || !insertTextCommand || !dialog || !externalTargets.length) return;

    let lastTarget = editor;
    let dialogExternalTarget = null;
    const selections = new Map();
    const cleanupCallbacks = [];

    const rememberSelection = (target) => {
        selections.set(target, {
            start: target.selectionStart ?? target.value.length,
            end: target.selectionEnd ?? target.value.length,
            direction: target.selectionDirection || 'none'
        });
    };

    const restoreExternalTarget = (target) => {
        const savedSelection = selections.get(target) || {};
        const start = Math.min(savedSelection.start ?? target.value.length, target.value.length);
        const end = Math.min(savedSelection.end ?? start, target.value.length);

        lastTarget = target;
        target.focus();
        target.setSelectionRange(start, end, savedSelection.direction || 'none');
        rememberSelection(target);
    };

    const selectExternalTarget = (event) => {
        lastTarget = event.currentTarget;
        rememberSelection(event.currentTarget);
        // console.log('[SpecialCharacterTarget] external target selected', {
        //     eventType: event.type,
        //     targetId: event.currentTarget.id,
        //     selection: selections.get(event.currentTarget),
        //     activeElement: document.activeElement?.id || document.activeElement?.className
        // });
    };

    const selectEditorTarget = (event) => {
        if (dialog.id === 'specialCharacters' && dialogExternalTarget) return;

        lastTarget = editor;
        // console.log('[SpecialCharacterTarget] editor selected', {
        //     eventType: event.type,
        //     activeElement: document.activeElement?.id || document.activeElement?.className
        // });
    };

    externalTargets.forEach((target) => {
        ['focus', 'select', 'input', 'keyup', 'mouseup'].forEach((eventName) => {
            target.addEventListener(eventName, selectExternalTarget);
            cleanupCallbacks.push(() => target.removeEventListener(eventName, selectExternalTarget));
        });
        rememberSelection(target);
    });

    ['pointerdown', 'keydown', 'focusin'].forEach((eventName) => {
        editableElement.addEventListener(eventName, selectEditorTarget);
        cleanupCallbacks.push(() => editableElement.removeEventListener(eventName, selectEditorTarget));
    });

    dialog.on('change:id', (event, propertyName, newId, oldId) => {
        if (newId === 'specialCharacters') {
            dialogExternalTarget = lastTarget === editor ? null : lastTarget;
            return;
        }

        if (oldId !== 'specialCharacters' || !dialogExternalTarget) return;

        const target = dialogExternalTarget;
        dialogExternalTarget = null;

        setTimeout(() => {
            restoreExternalTarget(target);
            // console.log('[SpecialCharacterTarget] restored after dialog close', {
            //     targetId: target.id,
            //     selection: selections.get(target)
            // });
        }, 0);
    });

    insertTextCommand.on('execute', (event, commandArgs = []) => {
        const options = Array.isArray(commandArgs) ? (commandArgs[0] || {}) : commandArgs;
        const activeElement = document.activeElement;
        const isSpecialCharacterTile = activeElement?.closest?.('.ck-character-grid__tile');

        // console.log('[SpecialCharacterTarget] insertText execute', {
        //     text: options.text,
        //     lastTarget: lastTarget === editor ? 'editor' : lastTarget?.id,
        //     savedSelection: lastTarget === editor ? null : selections.get(lastTarget),
        //     activeElement: activeElement?.id || activeElement?.className,
        //     isSpecialCharacterTile: !!isSpecialCharacterTile
        // });

        if (lastTarget === editor || !isSpecialCharacterTile || !options.text) return;

        event.stop();

        const target = lastTarget;
        const savedSelection = selections.get(target) || {};
        const start = Math.min(savedSelection.start ?? target.value.length, target.value.length);
        const end = Math.min(savedSelection.end ?? start, target.value.length);
        const nextPosition = start + options.text.length;

        target.setRangeText(options.text, start, end, 'end');
        rememberSelection(target);
        // console.log('[SpecialCharacterTarget] inserted into external target', {
        //     targetId: target.id,
        //     insertedText: options.text,
        //     replacedRange: { start, end },
        //     nextSelection: selections.get(target)
        // });

        const inputEvent = typeof InputEvent === 'function'
            ? new InputEvent('input', {
                bubbles: true,
                inputType: 'insertText',
                data: options.text
            })
            : new Event('input', { bubbles: true });
        target.dispatchEvent(inputEvent);

        // CKEditor focuses the editing view after closing the character dialog.
        setTimeout(() => {
            selections.set(target, {
                start: nextPosition,
                end: nextPosition,
                direction: savedSelection.direction || 'none'
            });
            restoreExternalTarget(target);
        }, 0);
    }, { priority: 'highest' });

    editor._specialCharacterTargetRouterInstalled = true;
    editor.once('destroy', () => {
        cleanupCallbacks.forEach((cleanup) => cleanup());
        editor._specialCharacterTargetRouterInstalled = false;
    });
}

const RELATED_NEWS_SAMPLE_SRC = '/images/related_article_sample.png';
const RELATED_NEWS_SAMPLE_ALT = 'related article sample marker';
const RELATED_NEWS_DELETE_LOCK_ID = 'related-news-marker-lock';
const RELATED_NEWS_MODEL_ATTRIBUTE = 'isRelatedNewsMarker';
const FORCE_BLOCK_IMAGES_LOCK_ID = 'force-block-images';

export class RelatedNewsMarkerPlugin extends Plugin {
    static get pluginName() { return 'RelatedNewsMarkerPlugin'; }

    init() {
        const editor = this.editor;
        this._relatedNewsReinsertGraceUntil = 0;
        this._relatedNewsReinsertTimer = null;
        this._relatedNewsDragMoveUntil = 0;
        this._relatedNewsDragMoveTimer = null;
        this._syncRelatedNewsDeleteLock = null;
        this._hadRelatedNewsImageInDoc = false;
        this._lastRelatedNewsContextMenuUntil = 0;
        const schema = editor.model.schema;
        schema.extend('imageBlock', { allowAttributes: [ RELATED_NEWS_MODEL_ATTRIBUTE ] });
        schema.extend('imageInline', { allowAttributes: [ RELATED_NEWS_MODEL_ATTRIBUTE ] });

        editor.conversion.for('upcast').add((dispatcher) => {
            dispatcher.on('element:figure', (evt, data, api) => {
                const viewFigure = data.viewItem;
                const modelEl = data.modelRange?.start.nodeAfter;

                if (!modelEl || !(modelEl.is('element', 'imageBlock') || modelEl.is('element', 'imageInline'))) {
                    return;
                }

                const nestedImage = Array.from(viewFigure.getChildren()).find((child) => child.is?.('element', 'img'));
                const isRelatedNewsMarker =
                    viewFigure.hasClass('ck-related-news-marker') ||
                    nestedImage?.getAttribute('src') === RELATED_NEWS_SAMPLE_SRC;

                if (!isRelatedNewsMarker) {
                    return;
                }

                api.writer.setAttribute(RELATED_NEWS_MODEL_ATTRIBUTE, true, modelEl);
            }, { priority: 'low' });
        });

        editor.conversion.for('downcast').add((dispatcher) => {
            const syncMarkerClass = (evt, data, api) => {
                const item = data.item;
                if (!(item.is('element', 'imageBlock') || item.is('element', 'imageInline'))) return;

                const viewFigure = api.mapper.toViewElement(item);
                if (!viewFigure) return;

                const writer = api.writer;
                if (data.attributeNewValue) {
                    writer.addClass([ 'image', 'ck-related-news-marker' ], viewFigure);
                } else {
                    writer.removeClass('ck-related-news-marker', viewFigure);
                }
            };

            dispatcher.on(`attribute:${RELATED_NEWS_MODEL_ATTRIBUTE}:imageBlock`, syncMarkerClass);
            dispatcher.on(`attribute:${RELATED_NEWS_MODEL_ATTRIBUTE}:imageInline`, syncMarkerClass);
        });

        // 1) 다운캐스트: 마커 → 뷰에 시각적 요소 삽입
        editor.conversion.for('editingDowncast').markerToElement({
            model: 'relatedNewsPosition',
            view: (markerData, { writer }) => {
                const figure = writer.createContainerElement('figure', {
                    class: 'image ck-related-news-marker'
                });
                const image = writer.createEmptyElement('img', {
                    src: '/images/related_article_sample.png',
                    alt: 'related article sample',
                });
                writer.insert(writer.createPositionAt(figure, 0), image);
                return figure;
                /* return writer.createUIElement('div', { class: 'ck-related-news-marker' }, function (domDocument) {
                    const domEl = this.toDomElement(domDocument);
                    // domEl.innerHTML = `<span class="ck-related-news-marker__label">🔗 관련기사 노출 영역</span>`;
                    domEl.innerHTML = `
                        <div class="rnmc-relative-news">
                            <div class="relative-news-title-wrap">
                                <span class="relative-news-title" tabindex="0">관련기사</span>
                                <span class="relative-news-more" tabindex="0">more</span>
                            </div>
                            <a class="relative-news-one " tabindex="0">실제 기사에서 관련기사가 표시될 위치 안내입니다.</a>
                            <a class="relative-news-one " tabindex="0">편집 가이드 용으로 기사 내용에 반영되지 않습니다.</a>
                            <a class="relative-news-one " tabindex="0">관련기사 등록 시 노출되는 영역입니다.</a>
                            <a class="relative-news-one only-pc" tabindex="0">관련기사 등록 시 노출되는 영역입니다.</a>
                        </div>
                    `;
                    return domEl;
                }); */
            }
        });

        // 2) change:data 감지 → 마커 위치 업데이트 (디바운스)
        // let debounceTimer = null;
        // editor.model.document.on('change:data', () => {
        //     clearTimeout(debounceTimer);
        //     debounceTimer = setTimeout(() => this._updateMarker(), 50);
        // });
        editor.model.document.on('change:data', () => {
            this._syncRelatedNewsImage();
        });

        const clipboard = editor.plugins.get('ClipboardPipeline');
        this.listenTo(editor.editing.view.document, 'clipboardInput', (evt, data) => {
            if (this._shouldAllowRelatedNewsInternalDrop(data)) return;
            if (!this._hasRelatedNewsClipboardSource(data?.dataTransfer)) return;

            data?.preventDefault?.();
            data?.domEvent?.preventDefault?.();
            data?.domEvent?.stopPropagation?.();
            evt.stop();
        }, { priority: 'highest' });

        this.listenTo(clipboard, 'inputTransformation', (evt, data) => {
            if (this._shouldAllowRelatedNewsInternalDrop(data)) return;

            if (this._hasRelatedNewsClipboardSource(data?.dataTransfer)) {
                data.content = editor.data.processor.toView('');
                data?.preventDefault?.();
                evt.stop();
                return;
            }

            const view = editor.editing.view;
            const targets = [];

            for (const { item } of view.createRangeIn(data.content).getWalker({ ignoreElementEnd: true })) {
                if (!item.is?.('element', 'img')) continue;
                if (!this._isRelatedNewsSampleImageSrc(item.getAttribute('src'))) continue;

                const figure = item.parent?.is?.('element', 'figure') ? item.parent : null;
                targets.push(figure || item);
            }

            if (!targets.length) return;

            view.change(writer => {
                [ ...new Set(targets) ].forEach((node) => writer.remove(node));
            });
        }, { priority: 'highest' });

        this.listenTo(clipboard, 'outputTransformation', (evt, data) => {
            if (data.method === 'dragstart' && this._getSelectedRelatedNewsImage()) {
                this._beginRelatedNewsDragMove();
                return;
            }

            const relatedNewsImages = this._findRelatedNewsImagesInFragment(data.content);

            if (!relatedNewsImages.length) return;

            editor.model.change(writer => {
                relatedNewsImages.forEach((node) => {
                    if (node.root || node.parent) {
                        writer.remove(node);
                    }
                });
            });
        }, { priority: 'highest' });

        this.listenTo(clipboard, 'contentInsertion', (evt, data) => {
            if (this._shouldAllowRelatedNewsInternalDrop(data)) return;

            const relatedNewsImages = this._findRelatedNewsImagesInFragment(data.content);
            if (!relatedNewsImages.length) return;

            editor.model.change(writer => {
                relatedNewsImages.forEach((node) => writer.remove(node));
            });
        }, { priority: 'highest' });

        this.listenTo(clipboard, 'contentInsertion', () => {
            if (this._isRelatedNewsDragMoveActive()) {
                this._endRelatedNewsDragMoveSoon();
            }

            this._relatedNewsReinsertGraceUntil = 0;
            clearTimeout(this._relatedNewsReinsertTimer);
            this._relatedNewsReinsertTimer = setTimeout(() => {
                this._relatedNewsReinsertTimer = null;
                this._removeDuplicateRelatedNewsImages();
                this._syncRelatedNewsImage();
            }, 0);
        }, { priority: 'lowest' });

        // 3) 초기 렌더링
        editor.ui.once('ready', () => this._syncRelatedNewsImage());
        this._installDragMoveSupport();
        this._installDeleteGuard();
        this._installCutGuard();
        this._installContextMenuGuard();
    }

    /**
     * ArticleContentFormatter.splitNonBlankBlocks()와 동일한 로직:
     * - 빈 paragraph(<p><br></p>)를 구분자로 사용
     * - 구분자 사이의 비공백 블록 덩어리를 하나의 블록으로 카운트
     * - 블록의 마지막 노드 위치를 반환
     */
    _collectNonBlankBlocks() {
        const root = this.editor.model.document.getRoot();
        const children = Array.from(root.getChildren());

        const blocks = [];       // [{ nodes: [...], lastNode }]
        let currentGroup = [];   // 현재 덩어리에 속한 노드들

        const flushGroup = () => {
            if (currentGroup.length === 0) return;
            // 그룹 내 텍스트를 모두 합쳐서 비공백인지 확인
            const groupText = currentGroup
                .map(node => {
                    if (node.is('element', 'paragraph')) {
                        return Array.from(node.getChildren())
                            .map(n => n.data || '')
                            .join('');
                    }
                    // figure, table 등 비텍스트 블록은 무조건 비공백으로 간주
                    return 'X';
                })
                .join('');

            if (groupText.trim() !== '') {
                blocks.push({
                    nodes: [...currentGroup],
                    lastNode: currentGroup[currentGroup.length - 1]
                });
            }
            currentGroup = [];
        };

        for (const child of children) {
            // 관련기사 샘플 이미지는 5단락 계산에서 제외.
            if (this._isRelatedNewsSampleImageNode(child)) {
                continue;
            }

            const isEmptyParagraph = this._isEmptyParagraph(child);

            if (isEmptyParagraph) {
                // 빈 단락 = 구분자 → 현재 그룹 flush
                flushGroup();
            } else {
                currentGroup.push(child);
            }
        }
        // 마지막 그룹 flush
        flushGroup();

        return blocks;
    }

    /** <p><br></p> 또는 텍스트 없는 빈 paragraph 여부 */
    _isEmptyParagraph(node) {
        if (!node.is('element', 'paragraph')) return false;

        // 자식 노드 중 offsetSize > 0 인 게 있으면 비어있지 않음 (조합 중 글자 포함)
        for (const child of node.getChildren()) {
            if (child.offsetSize > 0) return false;
        }
        return true;
    }

    _findRelatedNewsImage() {
        const root = this.editor.model.document.getRoot();
        const range = this.editor.model.createRangeIn(root);

        for (const { item } of range.getWalker({ ignoreElementEnd: true })) {
            if (!item.is || !item.is('element')) continue;
            if (!(item.is('element', 'imageBlock') || item.is('element', 'imageInline'))) continue;

            if (this._isRelatedNewsSampleImageNode(item)) {
                return item;
            }
        }

        return null;
    }

    _findRelatedNewsImages() {
        const images = [];
        const root = this.editor.model.document.getRoot();
        const range = this.editor.model.createRangeIn(root);

        for (const { item } of range.getWalker({ ignoreElementEnd: true })) {
            if (this._isRelatedNewsSampleImageNode(item)) {
                images.push(item);
            }
        }

        return images;
    }

    _removeDuplicateRelatedNewsImages() {
        const images = this._findRelatedNewsImages();
        if (images.length <= 1) return;

        const keep = images[0];
        this.editor.model.change(writer => {
            images.slice(1).forEach((imageNode) => {
                if (imageNode.root && imageNode !== keep) {
                    writer.remove(imageNode);
                }
            });
        });
    }

    _findRelatedNewsImagesInFragment(fragment) {
        const images = [];

        const visit = (node) => {
            if (this._isRelatedNewsSampleImageNode(node)) {
                images.push(node);
                return;
            }

            if (!node?.getChildren) return;
            for (const child of node.getChildren()) {
                visit(child);
            }
        };

        visit(fragment);
        return images;
    }

    _isRelatedNewsSampleImageSrc(src) {
        if (!src) return false;

        try {
            return new URL(src, window.location.href).pathname === RELATED_NEWS_SAMPLE_SRC;
        } catch (error) {
            return src === RELATED_NEWS_SAMPLE_SRC;
        }
    }

    _hasRelatedNewsClipboardSource(dataTransfer) {
        if (!dataTransfer?.getData) return false;

        return [ 'text/html', 'text/plain', 'text/uri-list' ]
            .some((type) => this._clipboardTextHasRelatedNewsSource(dataTransfer.getData(type)));
    }

    _clipboardTextHasRelatedNewsSource(text) {
        if (!text) return false;

        const rawText = String(text);
        if (rawText.includes(RELATED_NEWS_SAMPLE_SRC)) return true;

        const doc = rawText.includes('<') && rawText.includes('>')
            ? new DOMParser().parseFromString(rawText, 'text/html')
            : null;

        if (doc) {
            const hasRelatedSource = Array.from(doc.querySelectorAll('img[src], source[src], a[href]'))
                .some((element) =>
                    this._isRelatedNewsSampleImageSrc(element.getAttribute('src')) ||
                    this._isRelatedNewsSampleImageSrc(element.getAttribute('href'))
                );

            if (hasRelatedSource) return true;
        }

        return rawText
            .split(/\s+/)
            .some((value) => this._isRelatedNewsSampleImageSrc(value));
    }

    _isRelatedNewsSampleImageNode(node) {
        if (!node || !node.is || !node.is('element')) return false;
        if (!(node.is('element', 'imageBlock') || node.is('element', 'imageInline'))) return false;
        return !!node.getAttribute(RELATED_NEWS_MODEL_ATTRIBUTE) ||
            this._isRelatedNewsSampleImageSrc(node.getAttribute('src'));
    }

    _getSelectedRelatedNewsImage() {
        const selected = this.editor.model.document.selection.getSelectedElement();
        return this._isRelatedNewsSampleImageNode(selected) ? selected : null;
    }

    _isRelatedNewsDeleteLockedSelection() {
        return !!this._getSelectedRelatedNewsImage() &&
            this._collectNonBlankBlocks().length >= 5 &&
            !this._isRelatedNewsDragMoveActive();
    }

    _isRelatedNewsDragMoveActive() {
        return Date.now() < this._relatedNewsDragMoveUntil;
    }

    _shouldAllowRelatedNewsInternalDrop(data) {
        return data?.method === 'drop' && this._isRelatedNewsDragMoveActive();
    }

    _beginRelatedNewsDragMove() {
        this._relatedNewsDragMoveUntil = Date.now() + 5000;
        clearTimeout(this._relatedNewsDragMoveTimer);
        this._syncRelatedNewsDeleteLock?.();
    }

    _endRelatedNewsDragMoveSoon() {
        clearTimeout(this._relatedNewsDragMoveTimer);
        this._relatedNewsDragMoveTimer = setTimeout(() => {
            this._relatedNewsDragMoveTimer = null;
            this._relatedNewsDragMoveUntil = 0;
            this._syncRelatedNewsDeleteLock?.();
        }, 0);
    }

    _installDragMoveSupport() {
        const viewDocument = this.editor.editing.view.document;

        this.listenTo(viewDocument, 'dragstart', () => {
            if (this._getSelectedRelatedNewsImage()) {
                this._beginRelatedNewsDragMove();
            }
        }, { priority: 'highest' });

        const endDragMove = () => {
            if (this._isRelatedNewsDragMoveActive()) {
                this._endRelatedNewsDragMoveSoon();
            }
        };

        this.listenTo(viewDocument, 'drop', endDragMove, { priority: 'lowest' });
        this.listenTo(viewDocument, 'dragend', endDragMove, { priority: 'lowest' });
    }

    _installCutGuard() {
        const viewDocument = this.editor.editing.view.document;
        const stopCut = (evt, data) => {
            if (!this._isRelatedNewsDeleteLockedSelection()) return;

            data?.preventDefault?.();
            data?.domEvent?.preventDefault?.();
            data?.domEvent?.stopPropagation?.();
            evt.stop();
        };

        this.listenTo(viewDocument, 'clipboardOutput', (evt, data) => {
            if (data?.method === 'cut') {
                stopCut(evt, data);
            }
        }, { priority: 'highest' });

        this.listenTo(viewDocument, 'keydown', (evt, data) => {
            const domEvent = data?.domEvent;
            const key = String(domEvent?.key || data?.key || '').toLowerCase();
            const keyCode = domEvent?.keyCode ?? data?.keyCode;
            const isCutShortcut =
                (domEvent?.ctrlKey || domEvent?.metaKey || data?.ctrlKey || data?.metaKey) &&
                !domEvent?.altKey &&
                (key === 'x' || keyCode === 88);

            if (!isCutShortcut) return;
            stopCut(evt, data);
        }, { priority: 'highest' });
    }

    _installContextMenuGuard() {
        const editableElement = this.editor.ui.getEditableElement?.();
        const viewDocument = this.editor.editing.view.document;

        const stopNativeEvent = (domEvent) => {
            domEvent?.preventDefault?.();
            domEvent?.stopPropagation?.();
            domEvent?.stopImmediatePropagation?.();
        };

        const shouldBlockNativeImageAction = (domEvent) => {
            return this._isRelatedNewsDomTarget(domEvent?.target) ||
                !!this._getSelectedRelatedNewsImage() ||
                Date.now() < this._lastRelatedNewsContextMenuUntil;
        };

        const stopContextMenu = (event) => {
            if (!this._isRelatedNewsDomTarget(event.target)) return;
            this._lastRelatedNewsContextMenuUntil = Date.now() + 3000;
            stopNativeEvent(event);
        };

        const stopNativeCopy = (event) => {
            if (!shouldBlockNativeImageAction(event)) return;
            stopNativeEvent(event);
        };

        this.listenTo(viewDocument, 'contextmenu', (evt, data) => {
            if (!this._isRelatedNewsDomTarget(data?.domTarget || data?.domEvent?.target)) return;

            this._lastRelatedNewsContextMenuUntil = Date.now() + 3000;
            data?.preventDefault?.();
            data?.domEvent && stopNativeEvent(data.domEvent);
            evt.stop();
        }, { priority: 'highest' });

        document.addEventListener('contextmenu', stopContextMenu, true);
        document.addEventListener('copy', stopNativeCopy, true);
        if (editableElement) {
            editableElement.addEventListener('contextmenu', stopContextMenu, true);
            editableElement.addEventListener('copy', stopNativeCopy, true);
        }

        this.editor.once('destroy', () => {
            document.removeEventListener('contextmenu', stopContextMenu, true);
            document.removeEventListener('copy', stopNativeCopy, true);
            if (editableElement) {
                editableElement.removeEventListener('contextmenu', stopContextMenu, true);
                editableElement.removeEventListener('copy', stopNativeCopy, true);
            }
        });
    }

    _isRelatedNewsDomTarget(domTarget) {
        const element = this._getDomElement(domTarget);
        if (!element) return false;

        if (element.closest?.('.ck-related-news-marker')) return true;

        const imageElement = element.matches?.('img') ? element : element.closest?.('img');
        return this._isRelatedNewsSampleImageSrc(imageElement?.getAttribute?.('src'));
    }

    _getDomElement(domTarget) {
        if (!domTarget) return null;
        return domTarget.nodeType === 1 ? domTarget : domTarget.parentElement;
    }

    _isFifthBlockCompleted(blocks) {
        if (!Array.isArray(blocks) || blocks.length < 5) return false;

        const fifthLastNode = blocks[4].lastNode;
        let nextNode = fifthLastNode ? fifthLastNode.nextSibling : null;

        // 샘플 이미지가 이미 있으면 건너뛰고 실제 구분 단락 확인.
        while (this._isRelatedNewsSampleImageNode(nextNode)) {
            nextNode = nextNode.nextSibling;
        }

        return !!nextNode && this._isEmptyParagraph(nextNode);
    }

    _getRelatedNewsMinAnchor(blocks) {
        if (!Array.isArray(blocks) || blocks.length < 5) return null;

        const fifthLastNode = blocks[4].lastNode;
        let nextNode = fifthLastNode ? fifthLastNode.nextSibling : null;

        while (this._isRelatedNewsSampleImageNode(nextNode)) {
            nextNode = nextNode.nextSibling;
        }

        // 5단락 뒤 빈 단락이 있으면 그 다음부터 관련기사 이미지가 오도록 기준점으로 사용.
        if (nextNode && this._isEmptyParagraph(nextNode)) {
            return nextNode;
        }

        return fifthLastNode;
    }

    _enforceRelatedNewsMinPosition(imageNode, minAnchorNode) {
        if (!imageNode || !minAnchorNode || !imageNode.root || !minAnchorNode.root) return;

        const imagePos = this.editor.model.createPositionBefore(imageNode);
        const minPos = this.editor.model.createPositionAfter(minAnchorNode);
        if (imagePos.compareWith(minPos) !== 'before') return;

        this.editor.model.change(writer => {
            writer.move(writer.createRangeOn(imageNode), minPos);
        });
    }

    _normalizeRelatedNewsImage(imageNode) {
        if (!imageNode || !imageNode.root) return imageNode;

        let normalizedImage = imageNode;

        this.editor.model.change(writer => {
            if (normalizedImage.is('element', 'imageInline')) {
                normalizedImage = convertInlineImageToBlock(this.editor, writer, normalizedImage) || normalizedImage;
            }
        });

        return normalizedImage;
    }

    _ensureRelatedNewsFigureClass(imageNode) {
        if (!imageNode || !imageNode.root) return;

        const current = imageNode.getAttribute('htmlFigureAttributes') || {};
        const classes = Array.isArray(current.classes) ? [ ...current.classes ] : [];
        const hasMarkerAttribute = !!imageNode.getAttribute(RELATED_NEWS_MODEL_ATTRIBUTE);
        let shouldUpdate = !hasMarkerAttribute;
        if (!classes.includes('image')) {
            classes.push('image');
            shouldUpdate = true;
        }
        if (!classes.includes('ck-related-news-marker')) {
            classes.push('ck-related-news-marker');
            shouldUpdate = true;
        }
        if (!shouldUpdate) return;

        this.editor.model.change(writer => {
            if (!hasMarkerAttribute) {
                writer.setAttribute(RELATED_NEWS_MODEL_ATTRIBUTE, true, imageNode);
            }
            writer.setAttribute('htmlFigureAttributes', { ...current, classes }, imageNode);
        });
    }

    _syncRelatedNewsImage() {
        if (this._isSyncingRelatedNewsImage) return;
        this._isSyncingRelatedNewsImage = true;

        try {
            const editor = this.editor;
            const blocks = this._collectNonBlankBlocks();
            const existingImage = this._findRelatedNewsImage();
            const now = Date.now();

            // 레거시 marker 렌더링이 남아있으면 클릭/선택을 방해할 수 있어 정리.
            if (editor.model.markers.has('relatedNewsPosition')) {
                editor.model.change(writer => writer.removeMarker('relatedNewsPosition'));
            }

            // 이동(잘라내기/붙여넣기) 중 잠깐 사라지는 구간에서는 자동 재삽입을 잠시 유예한다.
            if (this._hadRelatedNewsImageInDoc && !existingImage) {
                this._relatedNewsReinsertGraceUntil = now + 3000;
                this._scheduleRelatedNewsReinsert();
            }
            this._hadRelatedNewsImageInDoc = !!existingImage;

            if (blocks.length < 5) {
                if (existingImage) this._removeRelatedNewsImage(existingImage);
                this._hadRelatedNewsImageInDoc = false;
                return;
            }

            // 이미 존재하면 자동 재배치를 하지 않는다(사용자 이동 위치 유지).
            if (!this._isFifthBlockCompleted(blocks)) {
                return;
            }

            const minAnchorNode = this._getRelatedNewsMinAnchor(blocks);
            if (!minAnchorNode) return;

            if (existingImage) {
                const normalizedImage = this._normalizeRelatedNewsImage(existingImage);
                this._ensureRelatedNewsFigureClass(normalizedImage);
                this._enforceRelatedNewsMinPosition(normalizedImage, minAnchorNode);
                return;
            }

            if (now < this._relatedNewsReinsertGraceUntil) {
                return;
            }

            editor.model.change(writer => {
                const imageBlock = writer.createElement('imageBlock', {
                    src: RELATED_NEWS_SAMPLE_SRC,
                    alt: RELATED_NEWS_SAMPLE_ALT,
                    [RELATED_NEWS_MODEL_ATTRIBUTE]: true,
                    htmlFigureAttributes: {
                        classes: [ 'image', 'ck-related-news-marker' ]
                    }
                });
                writer.insert(imageBlock, writer.createPositionAfter(minAnchorNode));

                // 삽입 직후 커서를 관련기사 이미지 아래로 이동.
                const nextNode = imageBlock.nextSibling;
                if (nextNode && nextNode.is && nextNode.is('element', 'paragraph')) {
                    writer.setSelection(nextNode, 0);
                } else {
                    const belowParagraph = writer.createElement('paragraph');
                    writer.insert(belowParagraph, writer.createPositionAfter(imageBlock));
                    writer.setSelection(belowParagraph, 0);
                }
            });
            this._hadRelatedNewsImageInDoc = true;
        } finally {
            this._isSyncingRelatedNewsImage = false;
        }
    }

    _scheduleRelatedNewsReinsert() {
        clearTimeout(this._relatedNewsReinsertTimer);

        const delay = Math.max(0, this._relatedNewsReinsertGraceUntil - Date.now()) + 10;
        this._relatedNewsReinsertTimer = setTimeout(() => {
            this._relatedNewsReinsertTimer = null;
            this._syncRelatedNewsImage();
        }, delay);
    }

    _installDeleteGuard() {
        const editor = this.editor;
        const deleteCommand = editor.commands.get('delete');
        const deleteForwardCommand = editor.commands.get('deleteForward');
        if (!deleteCommand && !deleteForwardCommand) return;

        const syncDeleteLock = () => {
            const isLockTarget = this._isRelatedNewsDeleteLockedSelection();

            if (deleteCommand) {
                if (isLockTarget) {
                    deleteCommand.forceDisabled(RELATED_NEWS_DELETE_LOCK_ID);
                } else {
                    deleteCommand.clearForceDisabled(RELATED_NEWS_DELETE_LOCK_ID);
                }
            }

            if (deleteForwardCommand) {
                if (isLockTarget) {
                    deleteForwardCommand.forceDisabled(RELATED_NEWS_DELETE_LOCK_ID);
                } else {
                    deleteForwardCommand.clearForceDisabled(RELATED_NEWS_DELETE_LOCK_ID);
                }
            }
        };

        editor.model.document.selection.on('change:range', syncDeleteLock);
        editor.model.document.selection.on('change:attribute', syncDeleteLock);
        editor.model.document.on('change:data', syncDeleteLock);
        this._syncRelatedNewsDeleteLock = syncDeleteLock;
        syncDeleteLock();
    }

    _removeRelatedNewsImage(imageNode = null) {
        const target = imageNode || this._findRelatedNewsImage();
        if (!target || !target.root) return;

        this.editor.model.change(writer => {
            writer.remove(target);
        });
    }

    _updateMarker() {
        if (this._isUpdatingMarker) return;  // ← 추가
        this._isUpdatingMarker = true;       // ← 추가

        const editor = this.editor;
        const blocks = this._collectNonBlankBlocks();
        const count = blocks.length;

        if (count < 5) {
            this._removeMarker();
            this._isUpdatingMarker = false;  // ← 추가
            return;
        }

        // ArticleContentFormatter , article-preview-utils 조건과 동일:
        // count >= 7 → 5번째 블록(index 4) 뒤
        // count < 7  → 마지막 블록 뒤
        const targetIndex = 4;
        const targetLastNode = blocks[targetIndex].lastNode;

        editor.model.change(writer => {
            const markerRange = writer.createRange(
                writer.createPositionAfter(targetLastNode),
                writer.createPositionAfter(targetLastNode)
            );

            if (editor.model.markers.has('relatedNewsPosition')) {
                writer.updateMarker('relatedNewsPosition', { range: markerRange });
            } else {
                writer.addMarker('relatedNewsPosition', {
                    range: markerRange,
                    usingOperation: false,
                    affectsData: false  // getData()에 포함 안 됨
                });
            }
        });

        this._isUpdatingMarker = false;  // ← 추가
    }

    _removeMarker() {
        const editor = this.editor;
        if (editor.model.markers.has('relatedNewsPosition')) {
            editor.model.change(writer => writer.removeMarker('relatedNewsPosition'));
        }
    }

    destroy() {
        clearTimeout(this._relatedNewsReinsertTimer);
        clearTimeout(this._relatedNewsDragMoveTimer);
        this._relatedNewsReinsertTimer = null;
        this._relatedNewsDragMoveTimer = null;
        const deleteCommand = this.editor.commands.get('delete');
        const deleteForwardCommand = this.editor.commands.get('deleteForward');
        if (deleteCommand) {
            deleteCommand.clearForceDisabled(RELATED_NEWS_DELETE_LOCK_ID);
        }
        if (deleteForwardCommand) {
            deleteForwardCommand.clearForceDisabled(RELATED_NEWS_DELETE_LOCK_ID);
        }
        this._removeRelatedNewsImage();
        super.destroy();
    }
}

// 데스크탑용 툴바
class ForceBlockImagesPlugin extends Plugin {
    static get pluginName() { return 'ForceBlockImagesPlugin'; }

    init() {
        const editor = this.editor;
        this._isNormalizingInlineImages = false;

        const inlineStyleCommand = editor.commands.get('imageStyle:inline');
        inlineStyleCommand?.forceDisabled(FORCE_BLOCK_IMAGES_LOCK_ID);

        editor.model.document.on('change:data', () => {
            if (this._isNormalizingInlineImages) return;
            if (!this._hasInlineImageChange()) return;

            this._normalizeInlineImages();
        });

        editor.ui.once('ready', () => this._normalizeInlineImages());
    }

    _hasInlineImageChange() {
        const editor = this.editor;
        const selectedElement = editor.model.document.selection.getSelectedElement();
        if (selectedElement?.is?.('element', 'imageInline')) {
            return true;
        }

        const changes = editor.model.document.differ.getChanges();
        return changes.some(change => {
            if (change.name === 'imageInline') {
                return true;
            }

            const changedNode =
                change.position?.nodeAfter ||
                change.range?.start?.nodeAfter ||
                change.range?.end?.nodeBefore;

            return changedNode?.is?.('element', 'imageInline') || false;
        });
    }

    _normalizeInlineImages() {
        const editor = this.editor;
        const inlineImages = [];
        const root = editor.model.document.getRoot();
        const range = editor.model.createRangeIn(root);

        for (const { item } of range.getWalker({ ignoreElementEnd: true })) {
            if (item?.is?.('element', 'imageInline')) {
                inlineImages.push(item);
            }
        }

        if (!inlineImages.length) return;

        this._isNormalizingInlineImages = true;

        try {
            editor.model.change(writer => {
                for (const imageNode of inlineImages) {
                    if (!imageNode.root || !imageNode.parent || !imageNode.is('element', 'imageInline')) {
                        continue;
                    }
                    if (isUploadingImageNode(imageNode)) {
                        continue;
                    }

                    const imageBlock = convertInlineImageToBlock(editor, writer, imageNode);
                    if (imageBlock?.is?.('element', 'imageBlock')) {
                        ensureImageFigureClass(writer, imageBlock);
                    }
                }
            });
        } finally {
            this._isNormalizingInlineImages = false;
        }
    }

    destroy() {
        this.editor.commands.get('imageStyle:inline')?.clearForceDisabled(FORCE_BLOCK_IMAGES_LOCK_ID);
        super.destroy();
    }
}

class ConditionalImageToolbarPlugin extends Plugin {
    static get pluginName() { return 'ConditionalImageToolbarPlugin'; }

    afterInit() {
        const editor = this.editor;
        const widgetToolbarRepository = editor.plugins.get('WidgetToolbarRepository');

        widgetToolbarRepository.register('conditionalImageToolbar', {
            ariaLabel: 'Image toolbar',
            items: [
                'toggleImageCaption',
                'imageTextAlternative',
                'linkImage',
                '|',
                'imageStyle:wrapText',
                'imageStyle:breakText',
                '|',
                'resizeImage'
            ],
            getRelatedElement: () => {
                const selected = editor.model.document.selection.getSelectedElement();
                if (!selected) return null;

                const isImage =
                    selected.is('element', 'imageBlock') || selected.is('element', 'imageInline');
                if (!isImage) return null;

                if (selected.getAttribute('src') === RELATED_NEWS_SAMPLE_SRC) {
                    return null;
                }

                return editor.editing.mapper.toViewElement(selected);
            }
        });
    }
}

export const desktopToolbar = {
    items: [
        'undo', 'redo', '|',
        'heading', 'style', '|',

        'alignment', 'bulletedList', 'numberedList', 'outdent', 'indent', '|',

        'bold', 'italic', 'underline', 'strikethrough',
        'subscript', 'superscript', 'fontColor', 'fontBackgroundColor', '|',

        // 'insertImage',
        'insertCustomTemplate', 'mediaEmbed', 'insertTable',
        'blockQuote', 'insertCustomHorizontalLine', 'link', 'specialCharacters', '|',
    ],
    shouldNotGroupWhenFull: true
};

// 모바일용 간소화된 툴바
export const mobileToolbar = {
    items: [
        'undo', 'redo', '|',
        'bold', 'italic', 'underline', '|',
        // 'insertImage',
        'mediaEmbed', 'insertCustomHorizontalLine',
    ],
    shouldNotGroupWhenFull: true // 모바일에서도 버튼이 넘치면 다음 줄로 넘어가는 것이 좋습니다.
};

const tableCellBackgroundColorPalette = [
    { color: '#000000', label: '검은색' },
    { color: '#4D4D4D', label: '진한 회색' },
    { color: '#999999', label: '회색' },
    { color: '#F6F6F8', label: '밝은 회색' },
    { color: '#FFFFFF', label: '흰색' },
    { color: '#E64D4D', label: '빨간색' },
    { color: '#E6994D', label: '주황색' },
    { color: '#E6E64D', label: '노랑색' },
    { color: '#99E64D', label: '연한 초록색' },
    { color: '#4DE64D', label: '초록색' },
    { color: '#4DE699', label: '연한 청록색' },
    { color: '#4DE6E6', label: '청록색' },
    { color: '#4D99E6', label: '연한 파랑색' },
    { color: '#4D4DE6', label: '파랑색' },
    { color: '#994DE6', label: '보라색' }
];

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
        SimpleUploadAdapter, //이미지 업로드를 위한 간단한 어댑터 -  서버와 연동하여 이미지를 처리할 때 사용
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
        //PasteFromMarkdownExperimental, //마크다운 형식을 붙여넣을 때 마크다운 구문을 해석하여 서식을 적용 - 베타버전 (~ 문자를 취소선으로 변환하는 문제로 비활성화)
        PasteFromOffice, //Microsoft Word, Excel 등 오피스 문서에서 복사한 내용을 붙여넣을 때 서식을 최대한 유지
        ShowBlocks, //문서 내의 HTML 블록 요소의 경계를 시각적으로 표시
        //SourceEditing, //에디터의 HTML 소스 코드를 직접 편집 - 개발자나 고급 사용자
        TextTransformation, //특정 텍스트 패턴을 자동으로 변환하는 기능 ((c)를 ©)
        WordCount, //에디터 내용의 단어 수와 문자 수를 계산하여 표시
        InsertCustomTemplateDropdownPlugin,
        InsertCustomHrDropdownPlugin,
        QuoteEnterAsSoftBreakPlugin,

        ForceBlockImagesPlugin,
        RelatedNewsMarkerPlugin,
        ConditionalImageToolbarPlugin
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
            { name: 'img', attributes: ['src','alt','width','height','id','data-image','class','data-id','data-key','data-chart-id', 'data-role', 'data-infographic-code'] },

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
            // { name: 'figure', attributes: ['class','data-src','contenteditable'], classes: [
            //         'obj_container',
            //         'image',
            //         'ck-related-news-marker',
            //         'resize-10', 'resize-20', 'resize-25', 'resize-33', 'resize-50', 'resize-75', 'resize-100',
            //         'align_left', 'align_right',
            //         'embed'
            //     ]
            // },
            // {
            //     name: 'figure',
            //     classes: [ 'media', 'ck-widget' ],
            //     attributes: true,
            //     styles: true
            // }

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
    },
    image: {
        // toolbar: []
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
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableCellProperties'],
        tableCellProperties: {
            backgroundColors: tableCellBackgroundColorPalette
        }
    },
    translations: [translations]
};

// 모달 테이블 에디터 설정
export const modalTableEditorConfig = {
    toolbar: {
        items: [
            'undo', 'redo', '|', 'insertTable','tableColumn', 'tableRow', 'mergeTableCells'
        ],
        shouldNotGroupWhenFull: true
    },
    plugins: [
        Essentials,
        Paragraph,
        Alignment,
        Table,
        TableCaption,
        TableProperties,
        TableToolbar,
        TableColumnResize,
        TableLayout,
        GeneralHtmlSupport,
    ],
    placeholder: '테이블 내용을 입력하세요.',
    htmlEmbed: {
        showPreviews: true
    },
    // 디버깅 유효성
    htmlSupport: {
        allow: [
            { name: 'table', attributes: true, classes: true },
            { name: 'tr', attributes: true, classes: true },
            { name: 'td', attributes: true, classes: true },
            { name: 'th', attributes: true, classes: true },
            { name: 'div', attributes: true, classes: true}
        ]
    },
    table: {
    },
    menuBar: {
        isVisible: false // 모달 에디터에서는 메뉴바 숨김
    },
    licenseKey: LICENSE_KEY,
    translations: [translations]
};

// ------------------------------------------------------------------------------------------------------------------------------------------//
let mainEditorInstance = null; // 초기화 전 null로 설정

let mainEditorResponsiveState = null;
let mainEditorRecreatePromise = null;

function isMobileEditorViewport() {
    return window.matchMedia('(max-width: 768px) and (hover: none) and (pointer: coarse)').matches;
}

const instantToolbarTooltipObservers = new WeakMap();
let editorFloatContainStylesInjected = false;

function enableInstantToolbarTooltips(editor) {
    if (!editor?.ui?.view?.toolbar) return;

    const applyInstantTooltipToToolbar = (toolbarElement) => {
        if (!toolbarElement) return;

        const tooltipTargets = toolbarElement.querySelectorAll('[data-cke-tooltip-text]:not([data-cke-tooltip-instant])');
        tooltipTargets.forEach((el) => {
            el.setAttribute('data-cke-tooltip-instant', 'true');
        });

        const tooltipPositionTargets = toolbarElement.querySelectorAll('[data-cke-tooltip-text]');
        tooltipPositionTargets.forEach((el) => {
            el.setAttribute('data-cke-tooltip-position', 'n');
        });
    };

    const syncToolbarTooltipBehavior = () => {
        const toolbarElement = editor.ui.view.toolbar.element;
        if (!toolbarElement) return;

        applyInstantTooltipToToolbar(toolbarElement);

        const currentObserver = instantToolbarTooltipObservers.get(editor);
        if (currentObserver?.element === toolbarElement) return;

        currentObserver?.observer.disconnect();

        const observer = new MutationObserver(() => {
            applyInstantTooltipToToolbar(toolbarElement);
        });

        observer.observe(toolbarElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-cke-tooltip-text']
        });

        instantToolbarTooltipObservers.set(editor, { observer, element: toolbarElement });
    };

    syncToolbarTooltipBehavior();
    editor.ui.on('update', syncToolbarTooltipBehavior, { priority: 'low' });

    editor.once('destroy', () => {
        editor.ui.off('update', syncToolbarTooltipBehavior);
        const currentObserver = instantToolbarTooltipObservers.get(editor);
        currentObserver?.observer.disconnect();
        instantToolbarTooltipObservers.delete(editor);
    });
}

// 에디터를 생성하는 함수
let mediaTypeAroundStylesInjected = false;

function injectEditorFloatContainStyles() {
    if (editorFloatContainStylesInjected || typeof document === 'undefined') {
        return;
    }

    const style = document.createElement('style');
    style.id = 'ck-editor-float-contain-styles';
    style.textContent = `
        .ck.ck-editor__editable.ck-content::after,
        .ck.ck-editor__editable::after {
            clear: both;
            content: '';
            display: table;
        }
    `;

    document.head.appendChild(style);
    editorFloatContainStylesInjected = true;
}

function injectMediaTypeAroundStyles() {
    if (mediaTypeAroundStylesInjected || typeof document === 'undefined') {
        return;
    }

    const style = document.createElement('style');
    style.id = 'ck-media-type-around-fix';
    style.textContent = `
        .ck-content figure.media.ck-widget {
            isolation: isolate;
            overflow: visible;
        }

        .ck-content figure.media.ck-widget > .ck-media__wrapper,
        .ck-content figure.media.ck-widget > .ck-media__wrapper iframe {
            position: relative;
            z-index: 1;
        }

        .ck-content figure.media.ck-widget > .ck-widget__type-around {
            inset: 0;
            pointer-events: none;
            position: absolute;
            z-index: 20;
        }

        .ck-content figure.media.ck-widget > .ck-widget__type-around > .ck-widget__type-around__button,
        .ck-content figure.media.ck-widget > .ck-widget__type-around > .ck-widget__type-around__fake-caret {
            pointer-events: auto;
            z-index: 21;
        }
    `;

    document.head.appendChild(style);
    mediaTypeAroundStylesInjected = true;
}

function createEditor(element, isMobile) {
    injectEditorFloatContainStyles();
    injectMediaTypeAroundStyles();

    const finalConfig = {
        ...editorConfig,
        toolbar: isMobile ? mobileToolbar : desktopToolbar,
        ui: {
            // SimpleBar 환경에서 navbar 높이(70px)를 알려줘야 sticky/bottom-limit 전환이 올바르게 계산됨
            viewportOffset: { top: 70 }
        },
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
            mainEditorResponsiveState = { isMobile };
            window.mainEditor = editor;
            console.log('%c[Main Editor Initialized]', 'color: green; font-weight: bold;', editor);
            enableInstantToolbarTooltips(editor);
            installImageUploadStatus(editor);
            installOffscreenWidgetBlurGuard(editor);
            installSpecialCharacterTargetRouter(editor);

            // 이미지에 data-id / data-key 허용 + 변환 등록
            enableImageDataAttributes(editor);
            installImageUploadCompletionHandler(editor);

            // 미디어에 data-id 허용 + 변환 등록
            enableMediaDataAttributes(editor);

            // 붙여넣기 시 HTML object로 승격될 수 있는 태그 정리
            installPasteHtmlSanitizer(editor);

            // 스타일 태그 제거
            stripInlineStylesOnPaste(editor);
            installQuoteEscapeHandler(editor);

            // 테이블 삽입 시 앞뒤 단락 자동 삽입
            installTablePaddingParagraphs(editor);

            //photo 이미지 추가
            installModalAPIs(editor);

            // 페이스북 글 복붙시 div 태그 변경
            convertPastedDivToParagraph(editor);

            // ⬇⬇⬇ 여기 삽입: createUploadAdapter 연결
            const csrf = getCsrfHeaders();
            const hk = null;

            const uploadUrl = editor.config.get('simpleUpload')?.uploadUrl || '/api/photo/upload';
            const uploadByUrlApi = '/api/photo/uploadUrl';

            editor.plugins.get('FileRepository').createUploadAdapter = (loader) =>
                new ResponseDtoUploadAdapter(editor , loader, uploadUrl, {
                    csrfHeaders: csrf,
                    hashkey: hk
                });

            installExternalImagePasteUpload(editor, {
                uploadUrl: uploadByUrlApi,
                csrfHeaders: csrf,
                hashkey: hk
            });

            //에디트 이미지 삭제 삭제시 썸네일 이미지 삭제
            onImageRemoved(editor, ({id}) => {
                myOnImageDeletedInternal(id);
            });

            new MediaActionHandler(editor, {
                csrfHeaders: csrf,
                hashkey: hk
            });

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
function recreateMainEditor(options = {}) {
    const editorTarget = document.querySelector('#editor');
    if (!editorTarget) {
        return Promise.resolve(null);
    }

    const nextIsMobile = typeof options.isMobile === 'boolean'
        ? options.isMobile
        : isMobileEditorViewport();

    if (mainEditorRecreatePromise) {
        return mainEditorRecreatePromise;
    }

    const currentEditor = mainEditorInstance;

    if (!currentEditor || currentEditor.isDestroyed) {
        mainEditorRecreatePromise = createEditor(editorTarget, nextIsMobile)
            .finally(() => {
                mainEditorRecreatePromise = null;
            });

        return mainEditorRecreatePromise;
    }

    const preservedData = currentEditor.getData();

    mainEditorRecreatePromise = currentEditor.destroy()
        .catch((error) => {
            console.error('[Main Editor] Failed to destroy the editor:', error);
            throw error;
        })
        .then(() => {
            mainEditorInstance = null;
            window.mainEditor = null;

            return createEditor(editorTarget, nextIsMobile);
        })
        .then((editor) => {
            if (editor && preservedData !== editor.getData()) {
                editor.setData(preservedData);
            }

            return editor;
        })
        .finally(() => {
            mainEditorRecreatePromise = null;
        });

    return mainEditorRecreatePromise;
}

window.recreateMainEditor = recreateMainEditor;

document.addEventListener('DOMContentLoaded', () => {
    const editorTarget = document.querySelector('#editor');
    if (!editorTarget) {
        console.error('[Main Editor] #editor element not found.');
        return;
    }

    // 미디어 쿼리를 정의합니다.
    const mobileMediaQuery = window.matchMedia('(max-width: 768px) and (hover: none) and (pointer: coarse)');

    // 초기 로드 시 에디터를 생성
    mainEditorRecreatePromise = createEditor(editorTarget, mobileMediaQuery.matches)
        .finally(() => {
            mainEditorRecreatePromise = null;
        });

    // 미디어 쿼리 상태가 변경될 때마다 이벤트
    mobileMediaQuery.addEventListener('change', (e) => {
        // 기존 에디터 인스턴스가 존재하면 삭제
        if (mainEditorResponsiveState?.isMobile === e.matches) {
            return;
        }

        console.log('[Main Editor] Screen size changed. Re-creating editor.');
        void recreateMainEditor({ isMobile: e.matches });
    });
});

// 모달 창 에디터 관리
const modalEditorInstances = new Map();

//포커스 무시 조건
function shouldIgnoreFocus(e) {
    return e.target.closest('.ck.ck-editor__editable, .ck.ck-balloon-panel, .ck.ck-dialog, .ck.ck-toolbar, .ck-word-count');
}

function collectTableElements(editor) {
    const tables = [];

    for (const root of editor.model.document.roots) {
        if (root.rootName === '$graveyard') continue;

        for (const value of editor.model.createRangeIn(root)) {
            const item = value.item;
            if (item?.is?.('element', 'table')) {
                tables.push(item);
            }
        }
    }

    return tables;
}

function installModalSingleTableLimit(editor) {
    if (editor._modalSingleTableLimitInstalled) return;

    const insertTableCommand = editor.commands.get('insertTable');
    if (!insertTableCommand) return;

    const disableId = 'modalSingleTableLimit';
    let isNormalizing = false;

    const syncInsertTableAvailability = () => {
        const hasTable = collectTableElements(editor).length >= 1;

        if (hasTable) {
            insertTableCommand.forceDisabled(disableId);
        } else {
            insertTableCommand.clearForceDisabled(disableId);
        }
    };

    const normalizeExtraTables = () => {
        if (isNormalizing) return;

        const tables = collectTableElements(editor);
        if (tables.length <= 1) {
            syncInsertTableAvailability();
            return;
        }

        isNormalizing = true;

        editor.model.change(writer => {
            tables.slice(1).forEach((table) => {
                if (table.root && table.parent) {
                    writer.remove(table);
                }
            });
        });

        isNormalizing = false;
        syncInsertTableAvailability();
    };

    editor.model.document.on('change:data', normalizeExtraTables);
    editor.on('destroy', () => {
        insertTableCommand.clearForceDisabled(disableId);
        editor._modalSingleTableLimitInstalled = false;
    });

    editor._modalSingleTableLimitInstalled = true;
    normalizeExtraTables();
}

//모달 에디터 초기화 및 내용 리셋
export function initModalTableEditor(textareaId) {
    let errorMsg;
    const el = document.getElementById(textareaId);

    if (!el) {
        errorMsg = `[Modal CKEditor] #${textareaId} not found.`;
        console.error(errorMsg);
        return Promise.reject(new Error(errorMsg));
    }

    const existing = modalEditorInstances.get(textareaId);
    if (existing && !existing.isDestroyed) {
        existing.setData("");
        existing.editing.view.focus();
        console.log(`[Modal CKEditor] Re-used existing editor for '${textareaId}'`);
        return Promise.resolve(existing);
    }

    return ClassicEditor.create(el, modalTableEditorConfig)
        .then((editor) => {
            modalEditorInstances.set(textareaId, editor);
            installModalSingleTableLimit(editor);
            stripAllFormattingOnPasteForModal(editor);
            enableInstantToolbarTooltips(editor);
            installOffscreenWidgetBlurGuard(editor);
            editor.editing.view.focus();
            console.log(
                `[Modal CKEditor] Created new editor for '${textareaId}' with config:`,
                editor.config.get("table.tableCellProperties")
            );
            return editor;
        })
        .catch((err) => {
            modalEditorInstances.delete(textareaId);
            console.error(`[Modal CKEditor] Initialization failed for '${textareaId}':`, err);
            return Promise.reject(err);
        });
}

//모달 에디터 Destroy
export function destroyModalTableEditor(textareaId) {
    const instance = modalEditorInstances.get(textareaId);

    if (instance && !instance.isDestroyed) {
        return instance
            .destroy()
            .then(() => {
                modalEditorInstances.delete(textareaId);
                console.log(`[Modal CKEditor] Destroyed editor for '${textareaId}'`);
            })
            .catch((err) => {
                modalEditorInstances.delete(textareaId);
                console.error(`[Modal CKEditor] Destroy failed for '${textareaId}':`, err);
            });
    }

    console.log(`[Modal CKEditor] No active editor for '${textareaId}'`);
    return Promise.resolve();
}

//특정 ID를 가진 CKEditor 인스턴스에 현재 입력된 HTML 데이터 반환
export function getModalTableEditorData(textareaId) {
    const instance = modalEditorInstances.get(textareaId);
    if (instance && !instance.isDestroyed) {
        return instance.getData();
    }

    console.warn(`[Modal CKEditor] No active editor for '${textareaId}' to get data from.`);
    return "";
}

// 모달 창, 서브 테이블 에디터 연결
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("stock1-modal");

    if (!modal) {
        console.warn(
            "[stock1-modal Integration] #stock1-modal not found. CKEditor integration for this modal might not work."
        );
        return;
    }

    modal.addEventListener("show.bs.modal", () => {
        console.log("[stock1-modal Integration] show.bs.modal triggered. Preparing modal editor.");
    });

    modal.addEventListener("hidden.bs.modal", () => {
        console.log("[stock1-modal Integration] hidden.bs.modal triggered. Destroying modal editor.");
        destroyModalTableEditor("modal-table-editor-textarea").catch((err) => {
            console.error("[stock1-modal Integration] Error on modal close cleanup:", err);
        });
    });
});


function stripInlineStylesOnPaste(editor) {
    const clipboard = editor.plugins.get('ClipboardPipeline');

    clipboard.on('inputTransformation', (evt, data) => {
        if (shouldPreserveInternalClipboardContent(editor, data)) {
            return;
        }

        const view = editor.editing.view;
        const walker = view.createRangeIn( data.content ).getWalker();

        view.change(writer => {
            for (const { item } of walker) {
                if (item.is('element')) {
                    // 1) style 속성 자체 제거
                    if (item.hasAttribute('style')) {
                        writer.removeAttribute('style', item);
                    }
                    if (item.hasAttribute('class')) {
                        writer.removeAttribute('class', item);
                    }
                    // 2) 인라인 CSS가 남았을 가능성까지 방지 (일부 브라우저/오피스 소스)
                    // CKEditor5에서는 styles는 attribute 형태이므로 위 한 줄이면 충분하지만
                    // 안전빵으로 동일 탐색을 계속
                }
            }
        });
    });
}

function installPasteHtmlSanitizer(editor) {
    const clipboard = editor.plugins.get('ClipboardPipeline');

    clipboard.on('inputTransformation', (evt, data) => {
        if (shouldPreserveInternalClipboardContent(editor, data)) return;

        const dataTransfer = data.dataTransfer;
        const clipboardHtml = dataTransfer?.getData ? dataTransfer.getData('text/html') : '';
        const contentHtml = editor.data.processor.toData(data.content);
        const sourceHtml = clipboardHtml || contentHtml;
        if (!sourceHtml) return;

        const sanitizedHtml = sanitizePastedHtml(sourceHtml);
        if (!sanitizedHtml || sanitizedHtml === sourceHtml) return;

        data.content = editor.data.processor.toView(sanitizedHtml);
    }, { priority: 'high' });
}

function shouldPreserveInternalClipboardContent(editor, data) {
    const dataTransfer = data?.dataTransfer;

    if (dataTransfer?.getData && isInternalCkEditorPaste(dataTransfer)) {
        return true;
    }

    return isInternalEditorImageTransfer(editor, data);
}

function isInternalCkEditorPaste(dataTransfer) {
    const internalClipboardTypes = [
        'application/vnd.ck-editor5',
        'application/ckeditor5-editor-data',
        'application/x-ckeditor5-data'
    ];

    return internalClipboardTypes.some((type) => {
        try {
            return Boolean(dataTransfer.getData(type));
        } catch (error) {
            return false;
        }
    });
}

function sanitizePastedHtml(html) {
    const preSanitizedHtml = stripKnownPasteArtifacts(html);
    const doc = new DOMParser().parseFromString(preSanitizedHtml, 'text/html');
    const allowedTags = new Set([
        'a', 'b', 'blockquote', 'br', 'em', 'figcaption', 'figure',
        'h1', 'h2', 'h3', 'hr', 'i', 'img', 'li', 'ol', 'p', 's',
        'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'th',
        'thead', 'tr', 'u', 'ul'
    ]);
    const unwrapTags = new Set([
        'article', 'aside', 'footer', 'header', 'main', 'nav', 'section'
    ]);
    const removeTags = new Set([
        'link', 'meta', 'noscript', 'script', 'style', 'template'
    ]);
    const replaceWithTextTags = new Set([
        'audio', 'embed', 'iframe', 'object', 'oembed', 'video'
    ]);
    let changed = preSanitizedHtml !== html;

    changed = removeCommentNodes(doc.body) || changed;
    changed = sanitizeWordSpecialCharacterArtifacts(doc.body) || changed;

    Array.from(doc.body.querySelectorAll('*'))
        .reverse()
        .forEach((element) => {
            const tagName = element.tagName.toLowerCase();

            if (isEditorBookmarkArtifact(element)) {
                removeBookmarkArtifactElement(element);
                changed = true;
                return;
            }

            if (stripPasteArtifactAttributes(element)) {
                changed = true;
            }

            if (isWordGeneratedImageElement(element)) {
                element.remove();
                changed = true;
                return;
            }

            if (tagName === 'div') {
                replacePastedDivElement(doc, element);
                changed = true;
                return;
            }

            if (removeTags.has(tagName)) {
                element.remove();
                changed = true;
                return;
            }

            if (replaceWithTextTags.has(tagName)) {
                replaceElementWithText(doc, element, getEmbedFallbackText(element));
                changed = true;
                return;
            }

            if (unwrapTags.has(tagName) || tagName.includes('-') || !allowedTags.has(tagName)) {
                unwrapElement(element);
                changed = true;
            }
        });

    changed = removeEmptyPasteArtifactElements(doc.body) || changed;

    return changed ? doc.body.innerHTML : html;
}

function stripKnownPasteArtifacts(html) {
    return String(html ?? '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<\/?o:p[^>]*>/gi, '')
        .replace(/<\/?(?:w|v|o|m):[^>]*>/gi, '')
        .replace(/<\?xml[^>]*>/gi, '')
        .replace(/<!\[if [\s\S]*?!endif\]>/gi, '');
}

function isEditorBookmarkArtifact(element) {
    if (!element) return false;

    if (isWordBookmarkAnchor(element)) {
        return true;
    }

    if (!element?.classList) return false;

    if (element.classList.contains('ck-bookmark')) {
        return true;
    }

    if (
        element.tagName?.toLowerCase() === 'span' &&
        element.classList.contains('ck-bookmark__icon')
    ) {
        return true;
    }

    return false;
}

function isWordBookmarkAnchor(element) {
    if (element?.tagName?.toLowerCase() !== 'a') return false;

    const id = element.getAttribute('id') || '';
    const name = element.getAttribute('name') || '';

    return /^_(?:Hlk|Toc)\d+/i.test(id) || /^_(?:Hlk|Toc)\d+/i.test(name);
}

function removeBookmarkArtifactElement(element) {
    if (!element) return;

    const hasChildren = element.childNodes?.length > 0;

    if (hasChildren) {
        unwrapElement(element);
        return;
    }

    element.remove();
}

function removeCommentNodes(root) {
    if (!root) return false;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
    const comments = [];

    while (walker.nextNode()) {
        comments.push(walker.currentNode);
    }

    comments.forEach((comment) => comment.remove());
    return comments.length > 0;
}

function sanitizeWordSpecialCharacterArtifacts(root) {
    if (!root) return false;

    const textPatterns = [
        /\uF0A7/g,
        /\uF0D8/g,
        /\uF0FC/g,
        /\uF0B7/g
    ];
    const cleanupAroundTextPattern = /(?:^|\s)[\u2192\u21D2\u279C\u2713\u2714\u2717\u2718]\s+(?=\S)/g;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let changed = false;

    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }

    textNodes.forEach((textNode) => {
        const original = textNode.nodeValue || '';
        let sanitized = original;

        textPatterns.forEach((pattern) => {
            sanitized = sanitized.replace(pattern, ' ');
        });

        sanitized = sanitized.replace(cleanupAroundTextPattern, ' ');

        if (sanitized !== original) {
            textNode.nodeValue = sanitized;
            changed = true;
        }
    });

    return changed;
}

function removeEmptyPasteArtifactElements(root) {
    if (!root) return false;

    let changed = false;
    const removableTags = new Set(['a', 'figcaption', 'figure', 'span', 'sub', 'sup']);

    Array.from(root.querySelectorAll('*'))
        .reverse()
        .forEach((element) => {
            const tagName = element.tagName?.toLowerCase();
            if (!removableTags.has(tagName)) return;

            const text = (element.textContent || '').replace(/\u00A0/g, ' ').trim();
            if (text) return;
            if (element.querySelector('img, video, audio, iframe, table, hr, br')) return;

            element.remove();
            changed = true;
        });

    return changed;
}

function stripPasteArtifactAttributes(element) {
    let changed = false;

    if (element.classList?.length) {
        const removableClasses = Array.from(element.classList).filter((className) => /^Mso/i.test(className));
        if (removableClasses.length > 0) {
            removableClasses.forEach((className) => element.classList.remove(className));
            if (element.classList.length === 0) {
                element.removeAttribute('class');
            }
            changed = true;
        }
    }

    const styleValue = element.getAttribute('style');
    if (styleValue && /(^|;)\s*mso-[^:]+:/i.test(styleValue)) {
        const sanitizedStyle = styleValue
            .split(';')
            .map((rule) => rule.trim())
            .filter((rule) => rule && !/^mso-[^:]+:/i.test(rule))
            .join('; ');

        if (sanitizedStyle) {
            element.setAttribute('style', sanitizedStyle);
        } else {
            element.removeAttribute('style');
        }
        changed = true;
    }

    if (element?.tagName?.toLowerCase() === 'a') {
        const href = element.getAttribute('href');

        if (href && isWordInternalReference(href)) {
            element.removeAttribute('href');
            changed = true;
        }
    }

    if (isWordBookmarkAnchor(element)) {
        if (element.hasAttribute('id')) {
            element.removeAttribute('id');
            changed = true;
        }

        if (element.hasAttribute('name')) {
            element.removeAttribute('name');
            changed = true;
        }
    }

    return changed;
}

function isWordInternalReference(value) {
    return /^#_(?:Hlk|Toc|ftn|edn)\d+/i.test(value || '');
}

function isWordGeneratedImageElement(element) {
    if (element?.tagName?.toLowerCase() !== 'img') return false;

    const src = element.getAttribute('src') || '';
    const alt = element.getAttribute('alt') || '';
    const className = element.getAttribute('class') || '';
    const width = Number.parseInt(element.getAttribute('width') || '0', 10) || 0;
    const height = Number.parseInt(element.getAttribute('height') || '0', 10) || 0;

    const isLocalFileImage = /^file:\/\//i.test(src);
    const isTinyBase64Image = /^data:image\//i.test(src) && width > 0 && height > 0 && width <= 48 && height <= 48;
    const hasWordImageMarker = /(?:\bmso|\bword\b|\bhwp\b|\bhnc\b|\bshape\b|\bicon\b|\bsmartart\b|\bbindata\b)/i.test(`${src} ${alt} ${className}`);

    return isLocalFileImage || isTinyBase64Image || hasWordImageMarker;
}

function replacePastedDivElement(doc, element) {
    if (containsBlockChild(element)) {
        unwrapElement(element);
        return;
    }

    const paragraph = doc.createElement('p');

    while (element.firstChild) {
        paragraph.appendChild(element.firstChild);
    }

    element.replaceWith(paragraph);
}

function containsBlockChild(element) {
    const blockTags = new Set([
        'blockquote', 'figure', 'h1', 'h2', 'h3', 'hr', 'li', 'ol', 'p',
        'table', 'tbody', 'td', 'th', 'thead', 'tr', 'ul'
    ]);

    return Array.from(element.children).some((child) => blockTags.has(child.tagName.toLowerCase()));
}

function unwrapElement(element) {
    const parent = element.parentNode;
    if (!parent) return;

    while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
    }

    parent.removeChild(element);
}

function replaceElementWithText(doc, element, text) {
    if (text) {
        element.replaceWith(doc.createTextNode(text));
        return;
    }

    element.remove();
}

function getEmbedFallbackText(element) {
    const candidateAttributes = ['url', 'src', 'data', 'href', 'poster'];

    for (const attributeName of candidateAttributes) {
        const value = element.getAttribute(attributeName);
        if (value) return value;
    }

    return (element.textContent || '').trim();
}

function stripAllFormattingOnPasteForModal(editor) {
    const clipboard = editor.plugins.get('ClipboardPipeline');
    const removableAttributes = [
        'style',
        'class',
        'width',
        'height',
        'bgcolor',
        'border',
        'cellpadding',
        'cellspacing',
        'align',
        'valign'
    ];

    clipboard.on('inputTransformation', (evt, data) => {
        const view = editor.editing.view;
        const walker = view.createRangeIn(data.content).getWalker();

        view.change(writer => {
            for (const { item } of walker) {
                if (!item.is('element')) continue;

                removableAttributes.forEach((attr) => {
                    if (item.hasAttribute(attr)) {
                        writer.removeAttribute(attr, item);
                    }
                });
            }
        });
    }, { priority: 'high' });
}

function convertPastedDivToParagraph(editor) {
    editor.data.upcastDispatcher.on(
        'element:div',
        (evt, data, conversionApi) => {
            const viewDiv = data.viewItem;

            // 페이스북 복붙: dir="auto" 인 div만 처리
            if (viewDiv.getAttribute('dir') !== 'auto') return;

            // 이미 다른 컨버터가 소비했으면 스킵
            if (!conversionApi.consumable.test(viewDiv, { name: true })) return;
            conversionApi.consumable.consume(viewDiv, { name: true });

            // paragraph 모델 요소 생성
            const paragraph = conversionApi.writer.createElement('paragraph');

            // div 안의 자식 노드들을 재귀적으로 변환해서 paragraph 안에 삽입
            const { modelRange } = conversionApi.convertChildren(viewDiv, paragraph);

            // 삽입 가능한 위치에 paragraph 넣기
            const insertResult = conversionApi.safeInsert(paragraph, data.modelCursor);
            if (!insertResult) return;

            conversionApi.updateConversionResult(paragraph, data);
        },
        { priority: 'high' }
    );
}

// === CSRF ===
function getCsrfHeaders() {
    const metaToken  = document.querySelector("meta[name='_csrf']");
    const metaHeader = document.querySelector("meta[name='_csrf_header']");
    if (metaToken && metaHeader) {
        return { [metaHeader.getAttribute('content')]: metaToken.getAttribute('content') };
    }
    const cookie = document.cookie.split('; ').find(r => r.startsWith('XSRF-TOKEN='));
    if (cookie) {
        return { 'X-CSRF-TOKEN': decodeURIComponent(cookie.split('=')[1]) };
    }
    return {};
}
// 사진 처리를 위한 커스텀 클래스
function installImageUploadStatus(editor) {
    const editorElement = editor.ui.view.element;
    const editableElement = editor.ui.getEditableElement?.() || editorElement?.querySelector('.ck-editor__editable');
    if (!editorElement || !editableElement || editor._imageUploadStatus) return;

    injectImageUploadStatusStyles();

    const anchor = document.createElement('div');
    anchor.className = 'ck-upload-status-anchor';

    const badge = document.createElement('div');
    badge.className = 'ck-upload-status-badge';
    badge.setAttribute('aria-live', 'polite');
    badge.setAttribute('aria-hidden', 'true');
    badge.innerHTML = '<span class="ck-upload-status-spinner"></span><span class="ck-upload-status-text">이미지 업로드 중...</span>';

    anchor.appendChild(badge);
    const textElement = badge.querySelector('.ck-upload-status-text');
    document.body.appendChild(anchor);

    let rafId = 0;

    const syncViewportPosition = () => {
        const rect = editableElement.getBoundingClientRect();
        const viewportPadding = 12;
        const visibleTop = Math.max(rect.top, viewportPadding);
        const visibleBottom = Math.min(rect.bottom, window.innerHeight - viewportPadding);
        const visibleHeight = visibleBottom - visibleTop;
        const isVisibleHorizontally = rect.right > viewportPadding && rect.left < window.innerWidth - viewportPadding;
        const isVisible = visibleHeight > 32 && isVisibleHorizontally;

        anchor.classList.toggle('is-active-area', isVisible);
        if (!isVisible) return;

        const stickyToolbar = editorElement.querySelector('.ck-sticky-panel__content');
        const toolbarRect = stickyToolbar?.getBoundingClientRect();
        let top = visibleTop + 12;

        if (toolbarRect && toolbarRect.bottom > visibleTop && toolbarRect.top < visibleBottom) {
            top = Math.max(top, toolbarRect.bottom + 12);
        }

        const maxTop = Math.max(visibleTop, visibleBottom - 44);
        const left = Math.min(Math.max(rect.left + (rect.width / 2), 96), window.innerWidth - 96);

        anchor.style.top = `${Math.round(Math.min(top, maxTop))}px`;
        anchor.style.left = `${Math.round(left)}px`;
    };

    const scheduleViewportPositionSync = () => {
        if (rafId) return;
        rafId = window.requestAnimationFrame(() => {
            rafId = 0;
            syncViewportPosition();
        });
    };

    const startTracking = () => {
        window.addEventListener('scroll', scheduleViewportPositionSync, true);
        window.addEventListener('resize', scheduleViewportPositionSync);
        scheduleViewportPositionSync();
    };

    const stopTracking = () => {
        window.removeEventListener('scroll', scheduleViewportPositionSync, true);
        window.removeEventListener('resize', scheduleViewportPositionSync);
        if (rafId) {
            window.cancelAnimationFrame(rafId);
            rafId = 0;
        }
        anchor.classList.remove('is-active-area');
    };

    editor._imageUploadStatus = {
        activeCount: 0,
        anchor,
        badge,
        textElement,
        startTracking,
        stopTracking,
        setMessage(message) {
            if (!this.textElement) return;
            this.textElement.textContent = message || '업로드 중...';
        },
        setActive(nextCount) {
            this.activeCount = Math.max(0, nextCount);
            const isActive = this.activeCount > 0;
            badge.classList.toggle('is-visible', isActive);
            badge.setAttribute('aria-hidden', String(!isActive));
            if (isActive) {
                this.startTracking();
            } else {
                this.stopTracking();
            }
        }
    };
}

function installOffscreenWidgetBlurGuard(editor) {
    const editableElement = editor.ui.getEditableElement?.() || editor.ui.view.element?.querySelector('.ck-editor__editable');
    if (!editableElement || editor._offscreenWidgetBlurGuard) return;

    let rafId = 0;
    const viewportMargin = 24;
    const editorBody = editableElement.ownerDocument?.body || document.body;

    const isTrackedWidget = (element) => {
        if (!element) return false;

        return element.is('element', 'imageBlock') ||
            element.is('element', 'imageInline') ||
            element.is('element', 'table');
    };

    const isTrackedViewportTarget = (element) => {
        if (!element) return false;

        return isTrackedWidget(element) || element.is('element', 'tableCell');
    };

    const getTrackedWidgetElement = () => {
        const selection = editor.model.document.selection;
        const selectedElement = selection.getSelectedElement();

        if (isTrackedWidget(selectedElement)) {
            return selectedElement;
        }

        const firstPosition = selection.getFirstPosition();
        if (!firstPosition) return null;

        const tableCellAncestor = firstPosition.findAncestor('tableCell');
        if (isTrackedViewportTarget(tableCellAncestor)) {
            return tableCellAncestor;
        }

        const tableAncestor = firstPosition.findAncestor('table');
        return isTrackedViewportTarget(tableAncestor) ? tableAncestor : null;
    };

    const clearTableCellSelection = () => {
        const selection = editor.model.document.selection;
        const firstPosition = selection.getFirstPosition();
        const tableElement =
            firstPosition?.findAncestor('table') ||
            (selection.getSelectedElement()?.is('element', 'table') ? selection.getSelectedElement() : null);

        if (!tableElement) {
            editableElement.blur();
            return;
        }

        editor.model.change(writer => {
            const parent = tableElement.parent;
            const tableIndex = tableElement.index;
            const nextSibling = parent.getChild(tableIndex + 1);
            const prevSibling = parent.getChild(tableIndex - 1);

            if (nextSibling?.is?.('element', 'paragraph')) {
                writer.setSelection(nextSibling, 0);
                return;
            }

            if (prevSibling?.is?.('element', 'paragraph')) {
                writer.setSelection(prevSibling, 'end');
                return;
            }

            writer.setSelection(writer.createPositionAfter(tableElement));
        });

        editableElement.blur();
    };

    const clearTextSelection = () => {
        const selection = editor.model.document.selection;
        const focusPosition = selection.getLastPosition?.() || selection.getFirstPosition();

        if (focusPosition) {
            editor.model.change(writer => {
                writer.setSelection(focusPosition);
            });
        }

        editableElement.blur();
    };

    const getDomTextSelectionRect = () => {
        const domSelection = editableElement.ownerDocument?.getSelection?.();
        if (!domSelection || domSelection.rangeCount === 0 || domSelection.isCollapsed) return null;

        const range = domSelection.getRangeAt(0);
        const commonAncestor = range.commonAncestorContainer;
        const ancestorElement =
            commonAncestor.nodeType === Node.ELEMENT_NODE ? commonAncestor : commonAncestor.parentElement;

        if (!ancestorElement || !editableElement.contains(ancestorElement)) return null;

        return range.getBoundingClientRect();
    };

    const getVisibleWidgetToolbarPanel = () =>
        Array.from(
            editorBody.querySelectorAll('.ck.ck-balloon-panel.ck-toolbar-container.ck-balloon-panel_visible')
        ).find(panel => panel.querySelector('.ck-balloon-rotator__content')) || null;

    const blurIfWidgetIsOffscreen = () => {
        rafId = 0;

        const visibleWidgetToolbarPanel = getVisibleWidgetToolbarPanel();
        if (!visibleWidgetToolbarPanel) return;

        const panelRect = visibleWidgetToolbarPanel.getBoundingClientRect();
        const isPanelVerticallyOffscreen =
            panelRect.bottom < viewportMargin ||
            panelRect.top > window.innerHeight - viewportMargin;

        const trackedElement = getTrackedWidgetElement();
        if (!trackedElement) {
            if (editor.model.document.selection.isCollapsed) return;

            const textSelectionRect = getDomTextSelectionRect();
            if (!textSelectionRect) return;

            const isTextSelectionVerticallyOffscreen =
                textSelectionRect.bottom < viewportMargin ||
                textSelectionRect.top > window.innerHeight - viewportMargin;

            if (isTextSelectionVerticallyOffscreen || isPanelVerticallyOffscreen) {
                clearTextSelection();
            }

            return;
        }

        const viewElement = editor.editing.mapper.toViewElement(trackedElement);
        if (!viewElement) return;

        const domElement = editor.editing.view.domConverter.mapViewToDom(viewElement);
        if (!(domElement instanceof Element)) return;

        const rect = domElement.getBoundingClientRect();
        const isTargetVerticallyOffscreen =
            rect.bottom < viewportMargin ||
            rect.top > window.innerHeight - viewportMargin;
        const shouldClearSelection = isTargetVerticallyOffscreen || isPanelVerticallyOffscreen;

        if (shouldClearSelection) {
            if (trackedElement.is('element', 'tableCell')) {
                clearTableCellSelection();
                return;
            }

            editableElement.blur();
        }
    };

    const scheduleBlurCheck = () => {
        if (rafId) return;

        rafId = window.requestAnimationFrame(blurIfWidgetIsOffscreen);
    };

    const destroy = () => {
        window.removeEventListener('scroll', scheduleBlurCheck, true);
        window.removeEventListener('resize', scheduleBlurCheck);

        if (rafId) {
            window.cancelAnimationFrame(rafId);
            rafId = 0;
        }

        editor._offscreenWidgetBlurGuard = null;
    };

    window.addEventListener('scroll', scheduleBlurCheck, true);
    window.addEventListener('resize', scheduleBlurCheck);
    editor.on('destroy', destroy);

    editor._offscreenWidgetBlurGuard = { destroy };
}

function injectImageUploadStatusStyles() {
    if (document.getElementById('ck-upload-status-styles')) return;

    const style = document.createElement('style');
    style.id = 'ck-upload-status-styles';
    style.textContent = `
        .ck-upload-status-anchor {
            position: fixed;
            top: 12px;
            left: 50%;
            z-index: 1080;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.18s ease;
            transform: translateX(-50%);
        }

        .ck-upload-status-anchor.is-active-area {
            opacity: 1;
        }

        .ck-upload-status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 999px;
            background: rgba(33, 37, 41, 0.88);
            color: #fff;
            font-size: 12px;
            font-weight: 600;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
            opacity: 0;
            transform: translateY(-10px);
            transition: opacity 0.18s ease, transform 0.18s ease;
        }

        .ck-upload-status-badge.is-visible {
            opacity: 1;
            transform: translateY(0);
        }

        .ck-upload-status-spinner {
            width: 12px;
            height: 12px;
            border: 2px solid rgba(255, 255, 255, 0.32);
            border-top-color: #fff;
            border-radius: 50%;
            animation: ck-upload-status-spin 0.8s linear infinite;
            flex: 0 0 auto;
        }

        @keyframes ck-upload-status-spin {
            to { transform: rotate(360deg); }
        }
    `;

    document.head.appendChild(style);
}

function beginImageUploadStatus(editor, message = '이미지 업로드 중...') {
    const status = editor?._imageUploadStatus;
    if (!status) return;
    status.setMessage(message);
    status.setActive(status.activeCount + 1);
}

function endImageUploadStatus(editor) {
    const status = editor?._imageUploadStatus;
    if (!status) return;
    status.setActive(status.activeCount - 1);
}

function getUploadErrorMessage(error, fallback = '이미지 업로드에 실패했습니다.') {
    if (typeof error === 'string' && error.trim()) return error;
    if (error?.message && String(error.message).trim()) return String(error.message).trim();
    return fallback;
}

function alertUploadError(error, fallback) {
    window.alert(getUploadErrorMessage(error, fallback));
}

function throwIfUploadResponseFailed(res, json, fallbackMessage = null) {
    const message = json?.message || json?.error?.message || fallbackMessage || `HTTP ${res.status}`;
    if (!res.ok || json?.success === false) {
        throw new Error(message);
    }
}

class ResponseDtoUploadAdapter {
    constructor(editor, loader, uploadUrl, opts = {}) {
        this.editor = editor;
        this.loader = loader;
        this.uploadUrl = uploadUrl;
        this.csrfHeaders = opts.csrfHeaders || {};
        this.hashkey = opts.hashkey || null;
        this.controller = new AbortController();
    }

    async upload() {
        const file = await this.loader.file;
        const form = new FormData();
        form.append('upload', file);
        if (this.hashkey) form.append('hashkey', this.hashkey);
        beginImageUploadStatus(this.editor);

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

        const photo = extractPhotoPayload(json);
        const id = photo.id;
        const key = photo.key;
        const murl = photo.mediumUrl;
        const url = photo.insertUrl;
        if (!url) throw new Error('업로드 응답에 이미지 URL 정보가 없습니다.');

        // 업로드 중 모델 이미지에는 uploadId가 있음 → 그 노드를 찾아 즉시 속성 세팅

        //이미지 추가시 대표 이미지 등록
        onModalSImageApplied(murl , '' , id  )

        return {
            urls: { default: url },
            photoId: id ? String(id) : null,
            photoKey: key ? String(key) : null,
            mediumUrl: murl
        };
        } catch (error) {
            alertUploadError(error);
            throw error;
        } finally {
            endImageUploadStatus(this.editor);
        }
    }
    abort() { this.controller.abort(); }
}

function installExternalImagePasteUpload(editor, opts = {}) {
    const clipboard = editor.plugins.get('ClipboardPipeline');
    const uploadUrl = opts.uploadUrl || '/api/photo/uploadUrl';
    const csrfHeaders = opts.csrfHeaders || {};
    const hashkey = opts.hashkey || null;

    clipboard.on('inputTransformation', (evt, data) => {
        if (data.method === 'drop' && isInternalEditorImageTransfer(editor, data)) return;

        const html = data.dataTransfer?.getData('text/html') || '';
        if (!html) return;

        const images = extractPastedImagesForUpload(html);
        if (!images.length) return;

        // 에디터에 삽입하지 않고 업로드 완료 후 삽입
        const sanitizedContent = removeUploadedImageSourcesFromViewContent(editor, data.content, images);
        if (sanitizedContent) {
            data.content = sanitizedContent;
        }

        void uploadExternalPastedImages(editor, images, {
            uploadUrl,
            csrfHeaders,
            hashkey
        });
    }, { priority: 'high' });
}

function isInternalEditorImageTransfer(editor, data) {
    if (!data) return false;

    if (data.sourceEditorId && editor?.id && String(data.sourceEditorId) === String(editor.id)) {
        return true;
    }

    if (data.method !== 'drop') return false;

    const html = data.dataTransfer?.getData('text/html') || '';
    if (!html) return false;

    const doc = new DOMParser().parseFromString(html, 'text/html');
    return Array.from(doc.querySelectorAll('img')).some(img =>
        img.hasAttribute('data-id') ||
        img.hasAttribute('data-key') ||
        img.hasAttribute('data-chart-id')
    );
}

function isUploadingImageNode(imageNode) {
    if (!imageNode?.is?.('element')) return false;

    const uploadId = imageNode.getAttribute?.('uploadId');
    if (uploadId !== undefined && uploadId !== null && String(uploadId) !== '') {
        return true;
    }

    const uploadStatus = imageNode.getAttribute?.('uploadStatus');
    if (typeof uploadStatus === 'string' && uploadStatus !== 'complete') {
        return true;
    }

    return false;
}

function removeUploadedImageSourcesFromViewContent(editor, content, images) {
    if (!content || !images.length) return null;

    const sourceSet = new Set(images.map((image) => image?.src).filter(Boolean));
    if (!sourceSet.size) return null;

    const html = editor.data.processor.toData(content);
    if (!html) return null;

    const doc = new DOMParser().parseFromString(html, 'text/html');
    let changed = false;

    Array.from(doc.querySelectorAll('figure')).forEach((figure) => {
        const img = figure.querySelector('img[src]');
        const src = (img?.getAttribute('src') || '').trim();
        if (!sourceSet.has(src)) return;

        figure.remove();
        changed = true;
    });

    Array.from(doc.querySelectorAll('img[src]')).forEach((img) => {
        const src = (img.getAttribute('src') || '').trim();
        if (!sourceSet.has(src)) return;

        img.remove();
        changed = true;
    });

    if (!changed) return null;
    return editor.data.processor.toView(doc.body.innerHTML);
}

async function uploadExternalPastedImages(editor, images, opts = {}) {
    beginImageUploadStatus(editor);

    try {
        for (const image of images) {
            try {
                const photo = await uploadPhotoByUrl(image.src, opts);
                insertUploadedImage(editor, photo, image);
            } catch (error) {
                alertUploadError(error);
                console.error('[ExternalImagePaste] upload failed:', image.src, error);
            }
        }
    } finally {
        endImageUploadStatus(editor);
    }
}

function installImageUploadCompletionHandler(editor) {
    const imageUploadEditing = editor.plugins.get('ImageUploadEditing');
    if (!imageUploadEditing || editor._customImageUploadCompletionHandlerInstalled) return;

    imageUploadEditing.on('uploadComplete', (evt, { data, imageElement }) => {
        if (!imageElement?.root) return;

        const photoId = data?.photoId || null;
        const photoKey = data?.photoKey || null;

        editor.model.change(writer => {
            if (photoId && !imageElement.getAttribute('data-id')) {
                writer.setAttribute('data-id', String(photoId), imageElement);
            }
            if (photoKey && !imageElement.getAttribute('data-key')) {
                writer.setAttribute('data-key', String(photoKey), imageElement);
            }
        });
    });

    editor._customImageUploadCompletionHandlerInstalled = true;
}

async function uploadPhotoByUrl(originalUrl, opts = {}) {
    const payload = { originalUrl };
    if (opts.hashkey) {
        payload.hashkey = opts.hashkey;
    }

    const res = await fetch(opts.uploadUrl || '/api/photo/uploadUrl', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(opts.csrfHeaders || {})
        },
        body: JSON.stringify(payload)
    });

    let json = null;
    try { json = await res.json(); } catch {}

    throwIfUploadResponseFailed(res, json);

    const photo = extractPhotoPayload(json);
    if (!photo.insertUrl) {
        throw new Error('Image URL is missing in upload response.');
    }

    return photo;
}

function insertUploadedImage(editor, photo, options = {}) {
    if (!photo?.insertUrl) return;

    const normalizedOptions = typeof options === 'string'
        ? { alt: options }
        : (options || {});

    const html = buildUploadedImageHtml(photo, normalizedOptions);
    if (!html) return;

    const viewFragment = editor.data.processor.toView(html);
    const modelFragment = editor.data.toModel(viewFragment);

    editor.model.change(() => {
        editor.model.insertContent(modelFragment, editor.model.document.selection);
    });

    onModalSImageApplied(
        photo.mediumUrl,
        normalizedOptions.caption || photo.title || normalizedOptions.alt || '',
        photo.id
    );
}

function extractPastedImagesForUpload(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const images = [];
    const seen = new Set();

    doc.querySelectorAll('figure img[src]').forEach(img => {
        const metadata = buildPastedImageMetadata(img, img.closest('figure'));
        if (!metadata) return;

        const dedupeKey = `${metadata.src}::${metadata.caption}::${metadata.width}`;
        if (seen.has(dedupeKey)) return;

        seen.add(dedupeKey);
        images.push(metadata);
    });

    doc.querySelectorAll('img[src]').forEach(img => {
        if (img.closest('figure')) return;

        const metadata = buildPastedImageMetadata(img);
        if (!metadata) return;

        const dedupeKey = `${metadata.src}::${metadata.caption}::${metadata.width}`;
        if (seen.has(dedupeKey)) return;

        seen.add(dedupeKey);
        images.push(metadata);
    });

    return images;
}

function buildPastedImageMetadata(img, figure = null) {
    if (!img) return null;

    const src = (img.getAttribute('src') || '').trim();
    if (!isUploadablePastedImageSource(src)) return null;

    const figureEl = figure || img.closest('figure');
    const caption = (figureEl?.querySelector('figcaption')?.textContent || '').trim();
    const width = extractPastedImageWidth(img, figureEl);

    return {
        src,
        alt: (img.getAttribute('alt') || '').trim(),
        chartId: (img.getAttribute('data-chart-id') || '').trim(),
        caption,
        width,
        figureClasses: extractPastedImageFigureClasses(figureEl, width)
    };
}

function extractPastedImageFigureClasses(figure, width = '') {
    const classes = new Set([ 'image' ]);
    const sourceClasses = Array.from(figure?.classList || []);

    sourceClasses.forEach((className) => {
        if (
            className === 'image' ||
            className === 'image_resized' ||
            className === 'obj_container' ||
            className === 'align_left' ||
            className === 'align_right' ||
            className.startsWith('image-style-')
        ) {
            classes.add(className);
        }
    });

    if (
        figure &&
        !sourceClasses.some((className) =>
            className.startsWith('image-style-') ||
            className === 'align_left' ||
            className === 'align_right'
        )
    ) {
        const floatValue = getInlineStyleValue(figure, 'float').toLowerCase();
        const marginLeft = getInlineStyleValue(figure, 'margin-left').toLowerCase();
        const marginRight = getInlineStyleValue(figure, 'margin-right').toLowerCase();

        if (floatValue === 'left') {
            classes.add('image-style-align-left');
        } else if (floatValue === 'right') {
            classes.add('image-style-align-right');
        } else if (marginLeft === 'auto' && marginRight === '0') {
            classes.add('image-style-block-align-right');
        } else if (marginLeft === '0' && marginRight === 'auto') {
            classes.add('image-style-block-align-left');
        }
    }

    if (width && !classes.has('obj_container')) {
        classes.add('image_resized');
    }

    return Array.from(classes);
}

function extractPastedImageWidth(img, figure = null) {
    const widthCandidates = [
        getInlineStyleValue(figure, 'width'),
        getInlineStyleValue(img, 'width'),
        normalizeLengthValue(img?.getAttribute('width') || '')
    ];

    for (const candidate of widthCandidates) {
        const width = normalizeLengthValue(candidate);
        if (width) {
            return width;
        }
    }

    return '';
}

function normalizeLengthValue(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^\d+(\.\d+)?%$/.test(raw)) return raw;
    if (/^\d+(\.\d+)?px$/i.test(raw)) return raw.toLowerCase();
    if (/^\d+(\.\d+)?$/.test(raw)) return `${raw}px`;
    return '';
}

function getInlineStyleValue(element, propertyName) {
    if (!element || !propertyName) return '';

    const styleValue = element.getAttribute?.('style') || '';
    if (!styleValue) return '';

    const pattern = new RegExp(`(?:^|;)\\s*${propertyName}\\s*:\\s*([^;]+)`, 'i');
    const match = styleValue.match(pattern);
    return match?.[1]?.trim() || '';
}

function buildUploadedImageHtml(photo, options = {}) {
    const figure = document.createElement('figure');
    const figureClasses = Array.isArray(options.figureClasses) ? options.figureClasses.filter(Boolean) : [];
    figure.className = figureClasses.length ? figureClasses.join(' ') : 'image';

    if (options.width) {
        figure.style.width = options.width;
    }

    const img = document.createElement('img');
    img.setAttribute('src', photo.insertUrl);
    img.setAttribute('alt', options.alt || '');
    if (photo.id) img.setAttribute('data-id', String(photo.id));
    if (photo.key) img.setAttribute('data-key', String(photo.key));
    if (options.chartId) img.setAttribute('data-chart-id', String(options.chartId));
    figure.appendChild(img);

    if (options.caption) {
        const figcaption = document.createElement('figcaption');
        figcaption.textContent = options.caption;
        figure.appendChild(figcaption);
    }

    return `${figure.outerHTML}<p></p>`;
}


function normalizeImageToFigure(editor, imageNode) {
    if (!imageNode || !imageNode.root) return imageNode;

    let normalizedImage = imageNode;

    editor.model.change(writer => {
        if (normalizedImage.is('element', 'imageInline')) {
            normalizedImage = convertInlineImageToBlock(editor, writer, normalizedImage) || normalizedImage;
        }

        if (normalizedImage.is('element', 'imageBlock')) {
            ensureImageFigureClass(writer, normalizedImage);
        }
    });

    return normalizedImage;
}

function convertInlineImageToBlock(editor, writer, imageNode) {
    if (!imageNode || !imageNode.parent || !imageNode.is('element', 'imageInline')) return imageNode;

    const paragraph = imageNode.parent;
    const container = paragraph.parent;
    if (!paragraph.is('element', 'paragraph') || !container) return imageNode;
    if (!editor.model.schema.checkChild(container, 'imageBlock')) return imageNode;

    const paragraphAttrs = Object.fromEntries(paragraph.getAttributes());
    const imageAttrs = Object.fromEntries(imageNode.getAttributes());
    const hasContentBefore = imageNode.index > 0;
    const hasContentAfter = imageNode.index < paragraph.childCount - 1;

    let insertionPosition = writer.createPositionBefore(paragraph);

    if (hasContentBefore) {
        const beforeParagraph = writer.createElement('paragraph', paragraphAttrs);
        writer.insert(beforeParagraph, insertionPosition);
        writer.move(
            writer.createRange(writer.createPositionAt(paragraph, 0), writer.createPositionBefore(imageNode)),
            writer.createPositionAt(beforeParagraph, 0)
        );
        insertionPosition = writer.createPositionAfter(beforeParagraph);
    }

    const imageBlock = writer.createElement('imageBlock', imageAttrs);
    writer.insert(imageBlock, insertionPosition);
    insertionPosition = writer.createPositionAfter(imageBlock);

    if (hasContentAfter) {
        const afterParagraph = writer.createElement('paragraph', paragraphAttrs);
        writer.insert(afterParagraph, insertionPosition);
        writer.move(
            writer.createRange(writer.createPositionAfter(imageNode), writer.createPositionAt(paragraph, 'end')),
            writer.createPositionAt(afterParagraph, 0)
        );
    }

    writer.remove(paragraph);
    return imageBlock;
}

function ensureImageFigureClass(writer, imageNode) {
    const current = imageNode.getAttribute('htmlFigureAttributes') || {};
    const classes = Array.isArray(current.classes) ? [ ...current.classes ] : [];
    if (classes.includes('image')) return;

    writer.setAttribute('htmlFigureAttributes', {
        ...current,
        classes: [ ...classes, 'image' ]
    }, imageNode);
}

function extractPhotoPayload(json) {
    const data = Array.isArray(json?.data) ? json.data[0] : json?.data;

    return {
        id: data?.id ?? json?.id ?? null,
        key: data?.hashkey ?? json?.hashkey ?? null,
        title: data?.title ?? json?.title ?? '',
        mediumUrl: data?.mediumUrl ?? data?.thumbUrl ?? data?.originalUrl ?? null,
        insertUrl: data?.thumbUrl ?? data?.originalUrl ?? null
    };
}

function isUploadablePastedImageSource(src) {
    if (!src) return false;

    try {
        const resolved = new URL(src, window.location.href);
        if (!/^https?:$/i.test(resolved.protocol)) return false;
        return true;
    } catch {
        return false;
    }
}


class MediaActionHandler {
    constructor(editor, opts) {
        this.editor = editor;
        this.csrfHeaders = opts.csrfHeaders || {};
        this._initListener();
    }

    _initListener() {
        this.editor.model.document.on('change:data', () => {

            const changes = this.editor.model.document.differ.getChanges();

            for (const change of changes) {

                if (change.name !== 'media' && change.name !== 'mediaInline') continue;
                if (change.type === 'insert') {
                    const mediaEl = change.position?.nodeAfter;   // ✅ 삽입된 media 모델 요소
                    if (!mediaEl) continue;
                    const url = mediaEl.getAttribute('url');
                    if (!url) continue;

                    // ✅ 1) 이미 저장된 media면(=data-id 있음) 서버 호출 금지
                    const existingId = mediaEl.getAttribute('data-id');
                    if (existingId) continue;

                    this.onAdded(url, mediaEl);

                } else if (change.type === 'remove' &&  change.name === 'media') {
                    this.onRemoved();
                }
            }
        });
    }

    async onAdded(url , mediaEl ) {
        beginImageUploadStatus(this.editor, '미디어 업로드 중...');
        // 추가 시 로직 (서버 API 호출 등)
        try {
            const res =  await fetch('/api/embed/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.csrfHeaders
                },
                body: JSON.stringify({
                    url: url,
                    hashkey: this.hashkey
                })
            });

            let jsonData =  null;
            try { jsonData = await res.json(); } catch {}

            if (!res.ok) {
                const msg = jsonData?.message || jsonData?.error?.message || `HTTP ${res.status}`;
                throw new Error(msg);
            }



            const data = Array.isArray(jsonData?.data) ? jsonData.data[0] : jsonData?.data;
            const savedId   = data?.id  ?? jsonData?.id  ?? null;


            if (!savedId) {
                console.warn('[MediaActionHandler] savedId가 없습니다. 응답:', jsonData);
                return;
            }

            // 클라이언트에서 URL로 타입 감지
            const mediaType = detectMediaType(url);  // 'youtube' or 'instagram'
            console.log(mediaType);

            // ✅ 서버 저장 ID를 모델 attribute로 심기 -> HTML data-id로 내려감
            this.editor.model.change(writer => {
                if (mediaEl.root) {
                    writer.setAttribute('data-id', String(savedId), mediaEl);
                    writer.setAttribute('data-type', mediaType, mediaEl);  // URL에서 감지한 타입
                }
            });

            // console.log('[MediaActionHandler] 서버 응답 완료:');
        } catch (error) {
            console.error('[MediaActionHandler] 서버 통신 실패:', error);
        } finally {
            endImageUploadStatus(this.editor);
        }

    }

    async onRemoved() {
        // 삭제 시 로직 (필요 시 서버에 상태 변경 알림)
        console.log('미디어가 본문에서 삭제되었습니다.');
    }
}

function installMediaUrlCollector(editor, { articleId, apiUrl, csrfHeaders }) {

    let sentUrls = new Set();
    let debounceTimer = null;

    editor.model.document.on('change:data', () => {
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(async () => {
            const html = editor.getData();
            const urls = extractMediaUrls(html);

            const newUrls = urls.filter(u => !sentUrls.has(u));
            if (newUrls.length === 0) return;

            try {
                await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...csrfHeaders
                    },
                    body: JSON.stringify({
                        source: newUrls
                    })
                });

                newUrls.forEach(u => sentUrls.add(u));
                console.log('[MediaCollector] saved', newUrls);

            } catch (e) {
                console.error('[MediaCollector] failed', e);
            }
        }, 500); // 디바운스 (붙여넣기 연속 방지)
    });
}

// 3) 업로드ID로 이미지 찾기
function findImageByUploadId(editor, uploadId) {
    const uid = String(uploadId);
    for (const root of editor.model.document.roots) {
        const range = editor.model.createRangeIn(root);
        for (const { item } of range.getWalker({ ignoreElementEnd: true })) {
            if (!item.is || !item.is('element')) continue;
            if (item.is('element', 'imageBlock') || item.is('element', 'imageInline')) {
                if (String(item.getAttribute('uploadId')) === uid) return item;
            }
        }
    }
    return null;
}
// 1) 유틸 함수로 분리
function enableImageDataAttributes(editor) {
    const imageDataAttributes = ['data-id', 'data-key', 'data-chart-id'];
    const schema = editor.model.schema;
    schema.extend('imageBlock',  { allowAttributes: imageDataAttributes });
    schema.extend('imageInline', { allowAttributes: imageDataAttributes });

    const conversion = editor.conversion;

    // 업캐스트: <img data-*> -> 모델 속성
    conversion.for('upcast').add((dispatcher) => {
        dispatcher.on('element:img', (evt, data, api) => {
            const viewImg = data.viewItem;
            const writer = api.writer;

            // 업캐스트 과정에서 매핑된 모델 엘리먼트는 data.modelRange 로 접근
            const modelEl = data.modelRange?.start.nodeAfter;
            if (!modelEl) return;

            imageDataAttributes.forEach((attr) => {
                const value = viewImg.getAttribute(attr);
                if (value) {
                    writer.setAttribute(attr, value, modelEl);
                }
            });
        }, { priority: 'low' });
    });

    // 다운캐스트: 모델 속성 -> <img data-*>
    conversion.for('downcast').add((dispatcher) => {
        const toImgAttr = (attr) => (evt, data, api) => {
            const item = data.item;
            if (!(item.is('element','imageBlock') || item.is('element','imageInline'))) return;

            let viewEl = api.mapper.toViewElement(item);
            if (!viewEl) return;
            let viewImg = viewEl;
            if (viewEl.name === 'figure') {
                for (const ch of viewEl.getChildren()) {
                    if (ch.is && ch.is('element','img')) { viewImg = ch; break; }
                }
            }
            if (!viewImg || viewImg.name !== 'img') return;

            const w = api.writer;
            if (data.attributeNewValue != null) w.setAttribute(attr, data.attributeNewValue, viewImg);
            else w.removeAttribute(attr, viewImg);
        };
        imageDataAttributes.forEach((attr) => {
            dispatcher.on(`attribute:${attr}:imageBlock`, toImgAttr(attr));
            dispatcher.on(`attribute:${attr}:imageInline`, toImgAttr(attr));
        });
    });
}


// URL에서 미디어 타입 감지
function detectMediaType(url) {
    if (!url) return 'unknown';

    const urlLower = url.toLowerCase();

    // YouTube 감지
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
        return 'youtube';
    }

    // Instagram 감지
    if (urlLower.includes('instagram.com')) {
        return 'instagram';
    }

    return 'other';
}

// function enableMediaDataAttributes(editor) {
//     const schema = editor.model.schema;
//
//     // media, mediaInline 둘 다 가능성 있어서 방어적으로 등록
//     if (schema.isRegistered('media')) {
//         schema.extend('media', { allowAttributes: ['data-id'] });
//     }
//     if (schema.isRegistered('mediaInline')) {
//         schema.extend('mediaInline', { allowAttributes: ['data-id'] });
//     }
//
//     const conversion = editor.conversion;
//
//     // ✅ Downcast: 모델 'data-id' -> View(figure)에 data-id
//     conversion.for('downcast').add((dispatcher) => {
//         const setFigureDataId = (evt, data, api) => {
//             const item = data.item;
//             if (!(item.is('element', 'media') || item.is('element', 'mediaInline'))) return;
//
//             const viewEl = api.mapper.toViewElement(item); // 보통 figure.media
//             if (!viewEl) return;
//
//             const w = api.writer;
//
//             if (data.attributeNewValue != null) {
//                 w.setAttribute('data-id', String(data.attributeNewValue), viewEl);
//             } else {
//                 w.removeAttribute('data-id', viewEl);
//             }
//         };
//
//         dispatcher.on('attribute:data-id:media', setFigureDataId);
//         dispatcher.on('attribute:data-id:mediaInline', setFigureDataId);
//     });
//
//     // ✅ Upcast(선택): 저장된 HTML을 다시 로드할 때 data-id 복원
//     conversion.for('upcast').add((dispatcher) => {
//         dispatcher.on('element:figure', (evt, data, api) => {
//             const viewFigure = data.viewItem;
//             const did = viewFigure.getAttribute('data-id');
//             if (!did) return;
//
//             const modelEl = data.modelRange?.start.nodeAfter;
//             if (!modelEl) return;
//
//             if (modelEl.is('element', 'media') || modelEl.is('element', 'mediaInline')) {
//                 api.writer.setAttribute('data-id', did, modelEl);
//             }
//         }, { priority: 'low' });
//     });
// }

function enableMediaDataAttributes(editor) {
    const schema = editor.model.schema;

    // media, mediaInline 둘 다 가능성 있어서 방어적으로 등록
    if (schema.isRegistered('media')) {
        schema.extend('media', { allowAttributes: ['data-id', 'data-type'] });
    }
    if (schema.isRegistered('mediaInline')) {
        schema.extend('mediaInline', { allowAttributes: ['data-id', 'data-type'] });
    }

    const conversion = editor.conversion;

    // ✅ Downcast: 모델 attr -> View(figure) attr
    conversion.for('downcast').add((dispatcher) => {
        const setFigureAttr = (attrName) => (evt, data, api) => {
            const item = data.item;
            if (!(item.is('element', 'media') || item.is('element', 'mediaInline'))) return;

            const viewEl = api.mapper.toViewElement(item); // 보통 figure.media
            if (!viewEl) return;

            const w = api.writer;

            if (data.attributeNewValue != null) {
                w.setAttribute(attrName, String(data.attributeNewValue), viewEl);
            } else {
                w.removeAttribute(attrName, viewEl);
            }
        };

        dispatcher.on('attribute:data-id:media', setFigureAttr('data-id'));
        dispatcher.on('attribute:data-id:mediaInline', setFigureAttr('data-id'));

        dispatcher.on('attribute:data-type:media', setFigureAttr('data-type'));
        dispatcher.on('attribute:data-type:mediaInline', setFigureAttr('data-type'));
    });

    // ✅ Upcast: 저장된 HTML 다시 로드할 때 figure의 attr 복원
    conversion.for('upcast').add((dispatcher) => {
        dispatcher.on('element:figure', (evt, data, api) => {
            const viewFigure = data.viewItem;

            const modelEl = data.modelRange?.start.nodeAfter;
            if (!modelEl) return;

            if (!(modelEl.is('element', 'media') || modelEl.is('element', 'mediaInline'))) return;

            const did = viewFigure.getAttribute('data-id');
            if (did) api.writer.setAttribute('data-id', did, modelEl);

            const dtype = viewFigure.getAttribute('data-type');
            if (dtype) api.writer.setAttribute('data-type', dtype, modelEl);
        }, { priority: 'low' });
    });
}


function installModalAPIs(editor){
    if (editor.model.insertViaCommand) return; // 이미 있으면 스킵
    editor.model.insertViaCommand = async function({ murl, turl , dataTitle , dataId, dataKey, alt='', extraAttributes = {} }){
        if (!turl) return;
        editor.execute('insertImage', { source: [{ src: turl, alt }] });
        const sel  = editor.model.document.selection;
        const node = sel.getSelectedElement();
        if (node && (node.is('element','imageBlock') || node.is('element','imageInline'))) {
            editor.model.change(w => {
                if (dataId)  w.setAttribute('data-id',  dataId,  node);
                if (dataKey) w.setAttribute('data-key', dataKey, node);
                Object.entries(extraAttributes || {}).forEach(([attrName, attrValue]) => {
                    if (attrValue !== undefined && attrValue !== null && attrValue !== '') {
                        w.setAttribute(attrName, String(attrValue), node);
                    }
                });

                // 캡션 강제 추가/갱신 (블록 이미지만)
                if (dataTitle && node.is('element','imageBlock')) {
                    let caption = Array.from(node.getChildren()).find(ch => ch.is('element','caption'));
                    if (!caption) {
                        caption = w.createElement('caption');
                        w.append(caption, node);
                    }

                    // 기존 내용 제거
                    while (caption.childCount) {
                        w.remove(caption.getChild(0));
                    }
                    w.insertText(String(dataTitle), caption, 0);
                }
            });
        }
        //이미지 추가시 대표 이미지 등록
        onModalSImageApplied(murl , dataTitle , dataId  )
    };
}

// 에디터 내 블록/인라인 이미지 스캔
function collectImages(editor) {
    const { model } = editor;
    const root = model.document.getRoot();
    const imgs = new Map();
    for (const item of model.createRangeIn(root).getItems()) {
        if (!(item.is('element','imageBlock') || item.is('element','imageInline'))) continue;
        const id  = item.getAttribute('data-id') || '';
        const uid = id ;            // 고유키. data-id가 있으면 우선
        if (!uid) continue;
        imgs.set(uid, { id, node: item });
    }
    return imgs;
}
// 사용: 이미지가 삭제되면 handler 호출
function onImageRemoved(editor, handler ) {
    let prev = collectImages(editor);
    // 초기화 직후에도 현재 상태 저장
    editor.model.document.on('change:data', () => {
        const curr = collectImages(editor);

        // prev에는 있고 curr에는 없는 항목 = 삭제된 이미지
        for (const [uid, meta] of prev.entries()) {
            if (!curr.has(uid)) handler({ id: meta.id });
        }
        prev = curr;
    });
}
// edit 사진 추가시  이미지추가
function onModalSImageApplied(murl , dataTitle ,dataId) {
    const rightPreviewsEl = document.getElementById('right-previews');

    if (!rightPreviewsEl) return;
    const hadSelected = !!rightPreviewsEl.querySelector('.figure[data-clicked="true"]');

    const html = `
        <div class="col-4 img-block">
            <figure class="figure" data-id="${dataId}" data-role="photo">
                <span class="badge-show badge text-bg-success position-absolute start-1">대표</span>
                <div class="image-box">
                    <img src="${murl}" class="figure-img img-fluid rounded" alt="">
                </div>
                <figcaption class="figure-caption">${dataTitle}</figcaption>
            </figure>
        </div>`;
    rightPreviewsEl.insertAdjacentHTML('beforeend', html);

    const figureCount = rightPreviewsEl.querySelectorAll('.figure').length;
    const sid = String(dataId);
    const selector = `figure.figure[data-id="${window.CSS?.escape ? CSS.escape(sid) : sid}"]`;
    const newFigure = rightPreviewsEl.querySelector(selector);
    if (newFigure && (!hadSelected || figureCount === 1)) {
        newFigure.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
}

// edit 사진 삭제시   이미지추가
function myOnImageDeletedInternal(id) {
    const wrap = document.getElementById('right-previews');
    if (!wrap) return;

    const sid = String(id);
    const sel = `figure.figure[data-id="${window.CSS?.escape ? CSS.escape(sid) : sid}"]`;
    const fig = wrap.querySelector(sel);
    if (!fig) return;
    const block = fig.closest('.img-block');
    (block || fig).remove();
}
// URL 추출 유틸 (YouTube / iframe / oembed 대응)
function extractMediaUrls(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const urls = new Set();

    // MediaEmbed 플러그인 결과
    doc.querySelectorAll('oembed[url]').forEach(el => {
        urls.add(el.getAttribute('url'));
    });

    // iframe 직접 임베드
    doc.querySelectorAll('iframe[src]').forEach(el => {
        urls.add(el.getAttribute('src'));
    });

    return Array.from(urls)
        .map(u => u && u.trim())
        .filter(Boolean);
}

function shouldEnableTablePaddingParagraphsByUrl() {
    const currentPath = window.location.pathname || '';
    const isArticleEdit = /^\/article\/[^/]+\/edit$/.test(currentPath);
    const isArticleWrite = currentPath === '/article/write';
    return isArticleEdit || isArticleWrite;
}

function installTablePaddingParagraphs(editor) {
    if (!shouldEnableTablePaddingParagraphsByUrl()) return;

    const insertTableCommand = editor.commands.get('insertTable');
    if (!insertTableCommand) return;

    editor.model.document.on('change:data', () => {
        const changes = editor.model.document.differ.getChanges();
        const tablesToDecorate = [];

        for (const change of changes) {
            if (change.type !== 'insert' || change.name !== 'table') continue;

            const tableNode = change.position?.nodeAfter;
            if (!tableNode || !tableNode.is('element', 'table')) continue;

            const htmlTableAttrs = tableNode.getAttribute('htmlTableAttributes');
            const classes = htmlTableAttrs?.classes ?? [];
            if (classes.includes('stock_table') || classes.includes('stock_table2')) continue;

            const tableParent = tableNode.parent;
            if (!tableParent) continue;

            const tableIndex = tableNode.index;
            const prevNode = tableParent.getChild(tableIndex - 1);
            const prevPrevNode = tableParent.getChild(tableIndex - 2);

            const hasTitleAbove = (node) => {
                if (!node || !node.is('element', 'paragraph')) return false;
                const attrs = node.getAttribute('htmlPAttributes');
                return attrs?.classes?.includes('table-title');
            };

            if (hasTitleAbove(prevNode) || hasTitleAbove(prevPrevNode)) continue;

            tablesToDecorate.push(tableNode);
        }

        if (!tablesToDecorate.length) return;

        editor.model.change(writer => {
            let firstCell = null;

            [...tablesToDecorate].reverse().forEach((tableNode) => {
                const tableParent = tableNode.parent;
                if (!tableParent) return;

                const tableIndex = tableNode.index;

                const nbspP = writer.createElement('paragraph');
                writer.insertText('\u00A0', nbspP, 0);
                writer.insert(nbspP, tableParent, tableIndex);

                const titleP = writer.createElement('paragraph');
                writer.setAttribute('htmlPAttributes', { classes: ['table-title'] }, titleP);
                writer.insertText('제목을 입력해주세요.', titleP, 0);
                writer.insert(titleP, tableParent, tableIndex + 1);

                const txtP = writer.createElement('paragraph');
                writer.setAttribute('htmlPAttributes', { classes: ['table-txt'] }, txtP);
                writer.insertText('단위, 출처 값을 입력해주세요.', txtP, 0);
                writer.insert(txtP, tableParent, tableIndex + 2);

                const newIndex = tableNode.index;
                const nbspP2 = writer.createElement('paragraph');
                writer.insertText('\u00A0', nbspP2, 0);
                writer.insert(nbspP2, tableParent, newIndex + 1);

                if (!firstCell) {
                    firstCell = tableNode.getChild(0)?.getChild(0)?.getChild(0) || null;
                }
            });

            if (firstCell) {
                writer.setSelection(firstCell, 0);
            }
        });
    });
}
