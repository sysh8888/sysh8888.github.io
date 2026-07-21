// 数据筛选页面逻辑
class DataFilterPage {
    constructor() {
        this.originalData = null;
        this.originalHeaders = [];
        this.selectedHeaders = [];
        this.filteredData = [];
        this.currentWorkbook = null;  // 存储当前Excel工作簿
        this.currentFileName = '';    // 存储当前文件名
        this.currentRawData = null;   // 存储原始数据（未处理）
        this.headerRowIndex = 0;      // 表头所在行索引（默认第一行）
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupDragAndDrop();
    }

    // 绑定事件
    bindEvents() {
        // 文件选择
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        // 清空数据
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearAllData();
        });

        // 清空选择
        document.getElementById('clearSelectedBtn').addEventListener('click', () => {
            this.clearSelectedHeaders();
        });

        // 生成预览
        document.getElementById('generatePreviewBtn').addEventListener('click', () => {
            this.generatePreview();
        });

        // 导出Excel
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportToExcel();
        });
        
        // 生成示例数据
        document.getElementById('generateSampleBtn').addEventListener('click', () => {
            this.generateSampleData();
        });
        
        // 解析选中的工作表
        document.getElementById('parseWorksheetBtn').addEventListener('click', () => {
            this.parseSelectedWorksheet();
        });
        
        // 取消工作表选择
        document.getElementById('cancelWorksheetBtn').addEventListener('click', () => {
            this.cancelWorksheetSelection();
        });
        
        // 表头行选择变化
        document.getElementById('headerRowSelect').addEventListener('change', (e) => {
            this.headerRowIndex = parseInt(e.target.value);
            this.reprocessCurrentData();
        });
    }

    // 设置拖拽功能
    setupDragAndDrop() {
        const originalContainer = document.getElementById('originalHeaders');
        const selectedContainer = document.getElementById('selectedHeaders');

        // 为容器添加拖拽事件
        this.setupDropZone(originalContainer);
        this.setupDropZone(selectedContainer);
    }

    // 设置拖拽区域
    setupDropZone(container) {
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('drag-over');
        });

        container.addEventListener('dragleave', (e) => {
            e.preventDefault();
            container.classList.remove('drag-over');
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('drag-over');
            
            const headerText = e.dataTransfer.getData('text/plain');
            const sourceContainer = e.dataTransfer.getData('source');
            
            this.handleDrop(headerText, container.id, sourceContainer);
        });
    }

    // 处理文件选择
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        document.getElementById('fileName').textContent = file.name;
        document.getElementById('clearBtn').style.display = 'inline-block';

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.parseFileData(e.target.result, file.name);
            } catch (error) {
                alert('文件解析失败: ' + error.message);
            }
        };

        if (file.name.toLowerCase().endsWith('.csv')) {
            reader.readAsText(file, 'UTF-8');
        } else {
            reader.readAsArrayBuffer(file);
        }
    }

    // 解析文件数据
    parseFileData(data, fileName) {
        this.currentFileName = fileName;
        
        if (fileName.toLowerCase().endsWith('.csv')) {
            this.parseCSV(data);
        } else {
            this.parseExcelFile(data);
        }
    }

    // 解析CSV文件
    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
            throw new Error('CSV文件为空');
        }

        // 解析所有行作为原始数据
        const rawData = lines.map(line => this.parseCSVLine(line));
        
        // 存储原始数据用于表头行选择
        this.currentRawData = rawData;
        this.headerRowIndex = 0; // 默认第一行
        
        // 显示表头行选择器并处理数据
        this.showHeaderRowSelector();
        this.processRawData();
    }

    // 解析CSV行（处理逗号和引号）
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"' && (i === 0 || line[i-1] === ',')) {
                inQuotes = true;
            } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i+1] === ',')) {
                inQuotes = false;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    // 解析Excel文件（检查是否有多个工作表）
    parseExcelFile(arrayBuffer) {
        try {
            this.currentWorkbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            if (this.currentWorkbook.SheetNames.length > 1) {
                // 多个工作表，显示选择器
                this.showWorksheetSelector();
            } else {
                // 只有一个工作表，直接解析
                this.parseWorksheet(this.currentWorkbook.SheetNames[0]);
            }
        } catch (error) {
            throw new Error('解析Excel文件失败：' + error.message);
        }
    }

    // 处理解析后的数据
    processData(headers, data) {
        this.originalHeaders = headers;
        this.originalData = data;
        this.selectedHeaders = [];
        this.filteredData = [];

        this.displayOriginalHeaders();
        this.showSections();
        
        console.log('解析完成:', {
            headers: headers.length,
            rows: data.length,
            sample: data.slice(0, 3)
        });
    }

    // 显示原始表头
    displayOriginalHeaders() {
        const container = document.getElementById('originalHeaders');
        container.innerHTML = '';

        this.originalHeaders.forEach(header => {
            const chip = this.createHeaderChip(header, false);
            container.appendChild(chip);
        });
    }

    // 创建表头小方块
    createHeaderChip(headerText, isSelected = false) {
        const chip = document.createElement('div');
        chip.className = `header-chip draggable ${isSelected ? 'selected' : ''}`;
        chip.draggable = true;
        chip.textContent = headerText;
        
        // 存储原始表头名称在数据属性中
        chip.setAttribute('data-header', headerText);

        // 添加删除按钮（仅选中状态显示）
        if (isSelected) {
            const removeBtn = document.createElement('div');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                this.removeFromSelected(headerText);
            };
            chip.appendChild(removeBtn);
        }

        // 拖拽事件
        chip.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', headerText);
            e.dataTransfer.setData('source', isSelected ? 'selected' : 'original');
            chip.classList.add('dragging');
        });

        chip.addEventListener('dragend', () => {
            chip.classList.remove('dragging');
        });

        return chip;
    }

    // 处理拖拽放置
    handleDrop(headerText, targetContainerId, sourceContainer) {
        if (targetContainerId === 'selectedHeaders') {
            // 拖拽到选择区域
            if (!this.selectedHeaders.includes(headerText)) {
                this.selectedHeaders.push(headerText);
                this.updateSelectedHeaders();
            }
        } else if (targetContainerId === 'originalHeaders' && sourceContainer === 'selected') {
            // 从选择区域拖回原始区域
            this.removeFromSelected(headerText);
        }
    }

    // 更新选中的表头显示
    updateSelectedHeaders() {
        const container = document.getElementById('selectedHeaders');
        
        if (this.selectedHeaders.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">将上方的表头拖动到这里进行筛选</p>';
            return;
        }

        container.innerHTML = '';
        this.selectedHeaders.forEach(header => {
            const chip = this.createHeaderChip(header, true);
            container.appendChild(chip);
        });

        // 设置选中区域的排序功能
        this.setupSortable(container);
    }

    // 设置选中区域的排序功能
    setupSortable(container) {
        let draggedElement = null;

        container.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('header-chip')) {
                draggedElement = e.target;
            }
        });

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(container, e.clientX);
            if (afterElement == null) {
                container.appendChild(draggedElement);
            } else {
                container.insertBefore(draggedElement, afterElement);
            }
        });

        container.addEventListener('dragend', () => {
            if (draggedElement) {
                // 更新selectedHeaders数组顺序，使用数据属性获取原始表头名称
                const newOrder = Array.from(container.children)
                    .filter(child => child.classList.contains('header-chip'))
                    .map(chip => chip.getAttribute('data-header') || chip.textContent.replace(/[×*+]/g, '').trim());
                this.selectedHeaders = newOrder;
                draggedElement = null;
            }
        });
    }

    // 获取拖拽后的位置
    getDragAfterElement(container, x) {
        const draggableElements = [...container.querySelectorAll('.header-chip:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // 从选择区域移除表头
    removeFromSelected(headerText) {
        const index = this.selectedHeaders.indexOf(headerText);
        if (index > -1) {
            this.selectedHeaders.splice(index, 1);
            this.updateSelectedHeaders();
        }
    }

    // 清空选择的表头
    clearSelectedHeaders() {
        this.selectedHeaders = [];
        this.updateSelectedHeaders();
        this.hidePreview();
    }

    // 生成预览
    generatePreview() {
        if (this.selectedHeaders.length === 0) {
            alert('请先选择要显示的表头');
            return;
        }

        this.filteredData = this.originalData.map(row => {
            const filteredRow = {};
            this.selectedHeaders.forEach(header => {
                filteredRow[header] = row[header] || '';
            });
            return filteredRow;
        });

        this.displayPreview();
    }

    // 显示预览表格
    displayPreview() {
        const table = document.getElementById('previewTable');
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');

        // 清理表头名称，移除可能的特殊字符
        const cleanHeaders = this.selectedHeaders.map(header => 
            String(header).replace(/[×*+]/g, '').trim()
        );

        // 生成表头
        thead.innerHTML = `
            <tr>
                ${cleanHeaders.map(header => 
                    `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${header}</th>`
                ).join('')}
            </tr>
        `;

        // 生成数据行（显示前50行）
        const displayData = this.filteredData.slice(0, 50);
        tbody.innerHTML = displayData.map(row => `
            <tr class="hover:bg-gray-50">
                ${this.selectedHeaders.map(header => 
                    `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${this.escapeHtml(row[header] || '')}</td>`
                ).join('')}
            </tr>
        `).join('');

        // 更新统计信息
        const statsDiv = document.getElementById('dataStats');
        statsDiv.innerHTML = `
            <div class="flex justify-between items-center">
                <span>共 ${this.filteredData.length} 行数据，显示前 ${Math.min(50, this.filteredData.length)} 行</span>
                <span>已选择 ${this.selectedHeaders.length} 列</span>
            </div>
        `;

        this.showPreview();
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 导出到Excel
    exportToExcel() {
        if (this.filteredData.length === 0) {
            alert('没有数据可导出');
            return;
        }

        try {
            // 清理表头名称，移除可能的特殊字符
            const cleanHeaders = this.selectedHeaders.map(header => 
                String(header).replace(/[×*+]/g, '').trim()
            );
            
            console.log('导出调试信息:');
            console.log('原始表头:', this.selectedHeaders);
            console.log('清理后表头:', cleanHeaders);
            console.log('过滤数据样例:', this.filteredData.slice(0, 2));
            
            // 重新映射数据，使用清理后的表头作为键
            const cleanedData = this.filteredData.map(row => {
                const cleanedRow = {};
                this.selectedHeaders.forEach((originalHeader, index) => {
                    const cleanHeader = cleanHeaders[index];
                    cleanedRow[cleanHeader] = row[originalHeader] || '';
                });
                return cleanedRow;
            });
            
            console.log('清理后数据样例:', cleanedData.slice(0, 2));
            
            const filename = `筛选数据_${new Date().toISOString().split('T')[0]}.csv`;
            ExcelHelper.downloadCsv(cleanedData, cleanHeaders, filename);
        } catch (error) {
            alert('导出失败: ' + error.message);
        }
    }

    // 清空所有数据
    clearAllData() {
        this.originalData = null;
        this.originalHeaders = [];
        this.selectedHeaders = [];
        this.filteredData = [];
        this.currentWorkbook = null;
        this.currentFileName = '';
        this.currentRawData = null;
        this.headerRowIndex = 0;

        document.getElementById('fileName').textContent = '未选择文件';
        document.getElementById('clearBtn').style.display = 'none';
        document.getElementById('fileInput').value = '';

        this.hideSections();
        this.hidePreview();
        this.hideWorksheetSelector();
        this.hideHeaderRowSelector();
    }

    // 显示相关区域
    showSections() {
        document.getElementById('originalHeadersSection').style.display = 'block';
        document.getElementById('selectedHeadersSection').style.display = 'block';
    }

    // 隐藏相关区域
    hideSections() {
        document.getElementById('originalHeadersSection').style.display = 'none';
        document.getElementById('selectedHeadersSection').style.display = 'none';
        this.hidePreview();
    }

    // 显示预览
    showPreview() {
        document.getElementById('previewSection').style.display = 'block';
    }

    // 隐藏预览
    hidePreview() {
        document.getElementById('previewSection').style.display = 'none';
    }
    
    // 显示工作表选择器
    showWorksheetSelector() {
        const selector = document.getElementById('worksheetSelector');
        const select = document.getElementById('worksheetSelect');
        
        // 清空选项
        select.innerHTML = '';
        
        // 添加工作表选项
        this.currentWorkbook.SheetNames.forEach((sheetName, index) => {
            const option = document.createElement('option');
            option.value = sheetName;
            option.textContent = `${sheetName} (工作表${index + 1})`;
            if (index === 0) option.selected = true; // 默认选中第一个
            select.appendChild(option);
        });
        
        selector.style.display = 'block';
        this.hideSections(); // 隐藏其他区域
    }
    
    // 隐藏工作表选择器
    hideWorksheetSelector() {
        document.getElementById('worksheetSelector').style.display = 'none';
        // 注意：不要在这里清空 currentWorkbook，因为解析时还需要使用
        // this.currentWorkbook = null;
    }
    
    // 取消工作表选择（用户主动取消）
    cancelWorksheetSelection() {
        this.hideWorksheetSelector();
        this.currentWorkbook = null;
        this.currentFileName = '';
        document.getElementById('fileName').textContent = '未选择文件';
        document.getElementById('clearBtn').style.display = 'none';
        document.getElementById('fileInput').value = '';
    }
    
    // 解析选中的工作表
    parseSelectedWorksheet() {
        console.log('开始解析选中的工作表...');
        console.log('currentWorkbook:', this.currentWorkbook);
        
        const select = document.getElementById('worksheetSelect');
        const selectedSheet = select.value;
        
        console.log('选中的工作表:', selectedSheet);
        
        if (!selectedSheet) {
            alert('请选择一个工作表');
            return;
        }
        
        if (!this.currentWorkbook) {
            console.error('工作簿数据丢失！');
            alert('工作簿数据丢失，请重新上传文件');
            this.hideWorksheetSelector();
            return;
        }
        
        this.hideWorksheetSelector();
        this.parseWorksheet(selectedSheet);
    }
    
    // 解析指定工作表
    parseWorksheet(sheetName) {
        try {
            // 检查工作簿是否存在
            if (!this.currentWorkbook) {
                throw new Error('工作簿数据不存在，请重新上传文件');
            }
            
            // 检查工作表是否存在
            if (!this.currentWorkbook.Sheets || !this.currentWorkbook.Sheets[sheetName]) {
                throw new Error(`工作表"${sheetName}"不存在`);
            }
            
            const worksheet = this.currentWorkbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length === 0) {
                throw new Error(`工作表"${sheetName}"为空`);
            }

            // 存储原始数据用于表头行选择
            this.currentRawData = jsonData;
            this.headerRowIndex = 0; // 重置为默认第一行
            
            // 更新文件名显示
            document.getElementById('fileName').textContent = `${this.currentFileName} - ${sheetName}`;
            
            // 显示表头行选择器并处理数据
            this.showHeaderRowSelector();
            this.processRawData();
            
        } catch (error) {
            console.error('解析工作表错误:', error);
            alert('解析工作表失败: ' + error.message);
        }
    }
    
    // 显示表头行选择器
    showHeaderRowSelector() {
        const selector = document.getElementById('headerRowSelector');
        const select = document.getElementById('headerRowSelect');
        
        if (!this.currentRawData || this.currentRawData.length === 0) {
            selector.style.display = 'none';
            return;
        }
        
        // 清空选项
        select.innerHTML = '';
        
        // 添加行选项（最多显示前10行）
        const maxRows = Math.min(10, this.currentRawData.length);
        for (let i = 0; i < maxRows; i++) {
            const option = document.createElement('option');
            option.value = i;
            const rowPreview = this.currentRawData[i] ? 
                this.currentRawData[i].slice(0, 3).map(cell => String(cell || '').trim()).filter(c => c).join(', ') :
                '空行';
            option.textContent = `第${i + 1}行: ${rowPreview}`;
            if (i === this.headerRowIndex) option.selected = true;
            select.appendChild(option);
        }
        
        selector.style.display = 'block';
    }
    
    // 隐藏表头行选择器
    hideHeaderRowSelector() {
        document.getElementById('headerRowSelector').style.display = 'none';
    }
    
    // 处理原始数据（根据选中的表头行）
    processRawData() {
        if (!this.currentRawData || this.currentRawData.length === 0) {
            throw new Error('没有数据可处理');
        }
        
        if (this.headerRowIndex >= this.currentRawData.length) {
            throw new Error('表头行索引超出范围');
        }
        
        const headers = this.currentRawData[this.headerRowIndex]
            .map(header => String(header || '').trim())
            .filter(h => h);
        
        if (headers.length === 0) {
            throw new Error(`第${this.headerRowIndex + 1}行没有有效的表头`);
        }
        
        const data = [];
        // 从表头行的下一行开始处理数据
        for (let i = this.headerRowIndex + 1; i < this.currentRawData.length; i++) {
            const row = this.currentRawData[i];
            if (row && row.some(cell => cell !== undefined && cell !== '')) {
                const rowData = {};
                headers.forEach((header, index) => {
                    rowData[header] = String(row[index] || '').trim();
                });
                data.push(rowData);
            }
        }
        
        this.processData(headers, data);
    }
    
    // 重新处理当前数据（表头行变化时调用）
    reprocessCurrentData() {
        if (this.currentRawData) {
            try {
                this.processRawData();
            } catch (error) {
                alert('处理数据失败: ' + error.message);
            }
        }
    }
    
    // 生成示例数据
    generateSampleData() {
        // 创建示例数据
        const sampleHeaders = [
            '姓名', '年龄', '性别', '部门', '职位', '入职日期', 
            '联系电话', '邮箱', '地址', '身份证号', '备注'
        ];
        
        const sampleData = [
            {
                '姓名': '张三',
                '年龄': '28',
                '性别': '男',
                '部门': '技术部',
                '职位': '软件工程师',
                '入职日期': '2022-03-15',
                '联系电话': '13800138001',
                '邮箱': 'zhangsan@example.com',
                '地址': '北京市朝阳区',
                '身份证号': '110101199001011234',
                '备注': '优秀员工'
            },
            {
                '姓名': '李四',
                '年龄': '32',
                '性别': '女',
                '部门': '人事部',
                '职位': 'HR专员',
                '入职日期': '2020-08-20',
                '联系电话': '13900139002',
                '邮箱': 'lisi@example.com',
                '地址': '上海市浦东新区',
                '身份证号': '310101198801015678',
                '备注': '部门骨干'
            },
            {
                '姓名': '王五',
                '年龄': '26',
                '性别': '男',
                '部门': '市场部',
                '职位': '市场专员',
                '入职日期': '2023-01-10',
                '联系电话': '13700137003',
                '邮箱': 'wangwu@example.com',
                '地址': '广州市天河区',
                '身份证号': '440101199801013456',
                '备注': '新入职员工'
            },
            {
                '姓名': '赵六',
                '年龄': '35',
                '性别': '女',
                '部门': '财务部',
                '职位': '会计',
                '入职日期': '2019-05-08',
                '联系电话': '13600136004',
                '邮箱': 'zhaoliu@example.com',
                '地址': '深圳市南山区',
                '身份证号': '440101198501014567',
                '备注': '财务主管'
            },
            {
                '姓名': '孙七',
                '年龄': '29',
                '性别': '男',
                '部门': '运营部',
                '职位': '运营经理',
                '入职日期': '2021-11-15',
                '联系电话': '13500135005',
                '邮箱': 'sunqi@example.com',
                '地址': '成都市锦江区',
                '身份证号': '510101199201015789',
                '备注': '管理层'
            }
        ];
        
        // 设置文件名
        document.getElementById('fileName').textContent = '示例数据.xlsx (系统生成)';
        document.getElementById('clearBtn').style.display = 'inline-block';
        
        // 创建原始数据格式用于表头选择
        this.currentRawData = [sampleHeaders];
        sampleData.forEach(row => {
            const rowArray = sampleHeaders.map(header => row[header] || '');
            this.currentRawData.push(rowArray);
        });
        this.headerRowIndex = 0;
        this.currentFileName = '示例数据.xlsx';
        
        // 显示表头行选择器并处理数据
        this.showHeaderRowSelector();
        this.processData(sampleHeaders, sampleData);
        
        // 显示成功提示
        this.showSuccessMessage('示例数据生成成功！现在可以尝试拖拽表头进行筛选。');
    }
    
    // 显示成功消息
    showSuccessMessage(message) {
        // 创建提示框
        const alert = document.createElement('div');
        alert.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        alert.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">✓</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(alert);
        
        // 3秒后自动消失
        setTimeout(() => {
            if (alert.parentNode) {
                document.body.removeChild(alert);
            }
        }, 3000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new DataFilterPage();
});
