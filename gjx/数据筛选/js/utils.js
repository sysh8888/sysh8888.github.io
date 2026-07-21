// 文本分析工具类
class TextAnalyzer {
    constructor() {
        // 企业类型关键词映射
        this.companyTypeKeywords = {
            '娱乐': ['娱乐', 'KTV', '歌厅', '夜总会', '酒吧'],
            '游艺': ['游艺', '电玩', '游戏厅', '娱乐城'],
            '网吧': ['网吧', '网咖', '网络会所', '上网服务'],
            '影院': ['影院', '电影院', '影城', '影厅'],
            '游泳': ['游泳', '游泳馆', '游泳池', '水上乐园'],
            '出版物': ['书店', '图书', '出版', '音像'],
            '印刷': ['印刷', '打印', '复印', '广告制作'],
            '文物': ['文物', '古玩', '收藏'],
            '演出': ['演出', '剧场', '音乐厅', '舞台'],
            '表演团体': ['表演', '艺术团', '乐团', '舞蹈团'],
            '旅行社': ['旅行社', '旅游公司'],
            '旅行社分社': ['分社', '分公司'],
            '旅行社网点': ['网点', '门市部'],
            '海上运动休闲': ['海上运动', '帆船', '游艇', '海钓'],
            '体育场馆': ['体育', '健身', '球馆', '运动场'],
            '校园周边': ['校园周边', '文具店', '小卖部'],
            '密室逃脱': ['密室', '逃脱', '密室逃脱'],
            '剧本杀': ['剧本杀', '推理'],
            '校外培训': ['培训', '教育', '学校', '补习'],
            '广电': ['广播', '电视', '有线电视'],
            '其他': ['其他']
        };

        // 日期正则表达式
        this.datePatterns = [
            /(\d{4})年(\d{1,2})月(\d{1,2})日/g,
            /(\d{4})-(\d{1,2})-(\d{1,2})/g,
            /(\d{4})\/(\d{1,2})\/(\d{1,2})/g,
            /(\d{1,2})月(\d{1,2})日/g,
        ];

        // 数量正则表达式
        this.quantityPatterns = [
            /共(\d+)家/g,
            /总计(\d+)家/g,
            /(\d+)家企业/g,
            /检查了(\d+)家/g,
            /检查(\d+)家/g,
            /(\d+)户/g,
        ];

        // 人员数量正则表达式
        this.staffPatterns = [
            /出动(\d+)人/g,
            /参与(\d+)人/g,
            /(\d+)名执法人员/g,
            /执法人员(\d+)人/g,
        ];
    }

    // 分析检查文本
    analyzeInspectionText(text) {
        return {
            dates: this.extractDates(text),
            companies: this.extractCompanies(text),
            quantities: this.extractQuantities(text),
            staffCounts: this.extractStaffCounts(text),
            companyTypes: this.identifyCompanyTypes(text)
        };
    }

    // 提取日期
    extractDates(text) {
        const dates = [];
        const currentYear = new Date().getFullYear();

        this.datePatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                let dateStr = '';
                if (match.length === 4) {
                    // 完整年月日
                    dateStr = `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`;
                } else if (match.length === 3) {
                    // 月日格式，使用当前年份
                    dateStr = `${currentYear}-${String(match[1]).padStart(2, '0')}-${String(match[2]).padStart(2, '0')}`;
                }

                if (dateStr && this.isValidDate(dateStr)) {
                    dates.push(dateStr);
                }
            }
        });

        return [...new Set(dates)]; // 去重
    }

    // 提取企业名称
    extractCompanies(text) {
        const companies = [];

        // 常见的企业名称模式
        const companyPatterns = [
            /([^，。、\s]+(?:有限公司|股份有限公司|公司|企业|中心|店|厂|馆|院|所|社|部))/g,
            /([^，。、\s]+(?:KTV|网吧|网咖|影院|游泳馆|书店|印刷厂|旅行社))/g,
        ];

        companyPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const company = match[1].trim();
                if (company.length > 1 && company.length < 50) {
                    companies.push(company);
                }
            }
        });

        return [...new Set(companies)]; // 去重
    }

    // 提取数量信息
    extractQuantities(text) {
        const quantities = [];

        this.quantityPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const num = parseInt(match[1]);
                if (!isNaN(num) && num > 0) {
                    quantities.push(num);
                }
            }
        });

        return quantities;
    }

    // 提取人员数量
    extractStaffCounts(text) {
        const staffCounts = [];

        this.staffPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const num = parseInt(match[1]);
                if (!isNaN(num) && num > 0) {
                    staffCounts.push(num);
                }
            }
        });

        return staffCounts;
    }

    // 识别企业类型
    identifyCompanyTypes(text) {
        const types = [];

        for (const [type, keywords] of Object.entries(this.companyTypeKeywords)) {
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    types.push(type);
                    break;
                }
            }
        }

        return [...new Set(types)]; // 去重
    }

    // 验证日期有效性
    isValidDate(dateStr) {
        const date = new Date(dateStr);
        return date instanceof Date && !isNaN(date.getTime());
    }

    // 智能提取检查信息汇总
    extractInspectionSummary(text) {
        const analysis = this.analyzeInspectionText(text);

        // 推断检查日期（取最近的日期或最常出现的日期）
        const inferredDate = analysis.dates.length > 0
            ? analysis.dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
            : new Date().toISOString().split('T')[0];

        // 推断企业总数
        const inferredCompanyCount = analysis.quantities.length > 0
            ? Math.max(...analysis.quantities)
            : analysis.companies.length;

        // 推断人员数量
        let inferredStaffCount;
        if (analysis.staffCounts.length > 0) {
            inferredStaffCount = Math.max(...analysis.staffCounts);
        } else {
            // 尝试获取系统配置中的默认倍数
            let multiplier = 3; // 默认倍数
            try {
                if (typeof db !== 'undefined') {
                    const config = db.getSystemConfig();
                    multiplier = config.defaultStaffMultiplier || 3;
                }
            } catch (error) {
                // 如果获取配置失败，使用默认值
                multiplier = 3;
            }
            inferredStaffCount = inferredCompanyCount * multiplier;
        }

        return {
            date: inferredDate,
            extractedCompanies: analysis.companies,
            identifiedTypes: analysis.companyTypes,
            totalCompanies: inferredCompanyCount,
            totalStaff: inferredStaffCount,
            confidence: this.calculateConfidence(analysis)
        };
    }

    // 计算识别置信度
    calculateConfidence(analysis) {
        let score = 0;

        if (analysis.dates.length > 0) score += 30;
        if (analysis.quantities.length > 0) score += 25;
        if (analysis.companies.length > 0) score += 25;
        if (analysis.staffCounts.length > 0) score += 20;

        return Math.min(100, score);
    }
}

// Excel 处理工具类
class ExcelHelper {
    // 将数据转换为CSV格式
    static toCsv(data, headers) {
        const csvHeaders = headers.join(',');
        const csvRows = data.map(row =>
            headers.map(header => {
                const value = row[header] || '';
                // 处理包含逗号或换行的值
                if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        );

        return [csvHeaders, ...csvRows].join('\n');
    }

    // 下载CSV文件
    static downloadCsv(data, headers, filename) {
        const csv = this.toCsv(data, headers);
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // 生成Excel模板
    static generateTemplate(headers, filename) {
        const data = [{}]; // 空行
        this.downloadCsv(data, headers, filename);
    }
}

// 日期工具类
class DateHelper {
    // 格式化日期
    static formatDate(date, format = 'YYYY-MM-DD') {
        const d = typeof date === 'string' ? new Date(date) : date;

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        return format
            .replace('YYYY', year.toString())
            .replace('MM', month)
            .replace('DD', day);
    }

    // 获取日期范围内的所有日期
    static getDateRange(startDate, endDate) {
        const dates = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(this.formatDate(d));
        }

        return dates;
    }

    // 获取月份范围
    static getMonthRange(year) {
        const months = [];
        for (let i = 1; i <= 12; i++) {
            const month = String(i).padStart(2, '0');
            months.push({
                label: `${year}年${i}月`,
                value: `${year}-${month}`
            });
        }
        return months;
    }

    // 获取年度范围
    static getYearRange(startYear, endYear) {
        const currentYear = new Date().getFullYear();
        const start = startYear || currentYear - 5;
        const end = endYear || currentYear + 1;

        const years = [];
        for (let year = start; year <= end; year++) {
            years.push(year);
        }
        return years;
    }
}

// 表单验证工具类
class ValidationHelper {
    // 验证企业信息
    static validateCompany(company) {
        const errors = [];

        if (!company.name || company.name.trim() === '') {
            errors.push('企业名称不能为空');
        }

        if (!company.type || company.type.trim() === '') {
            errors.push('企业类型不能为空');
        }

        if (company.creditCode && !/^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/.test(company.creditCode)) {
            errors.push('统一社会信用代码格式不正确');
        }

        return errors;
    }

    // 验证人员信息
    static validateStaff(staff) {
        const errors = [];

        if (!staff.name || staff.name.trim() === '') {
            errors.push('姓名不能为空');
        }

        if (staff.phone && !/^1[3-9]\d{9}$/.test(staff.phone)) {
            errors.push('手机号码格式不正确');
        }

        if (!staff.departmentId || staff.departmentId.trim() === '') {
            errors.push('所在科室不能为空');
        }

        return errors;
    }

    // 验证检查记录
    static validateInspectionRecord(record) {
        const errors = [];

        if (!record.date || record.date.trim() === '') {
            errors.push('检查日期不能为空');
        }

        if (!record.companies || record.companies.length === 0) {
            errors.push('检查企业不能为空');
        }

        if (!record.totalCompanies || record.totalCompanies <= 0) {
            errors.push('检查企业总数必须大于0');
        }

        if (!record.totalStaff || record.totalStaff <= 0) {
            errors.push('出动人员数量必须大于0');
        }

        return errors;
    }
}

// 统计工具类
class StatisticsHelper {
    // 生成统计报告
    static generateReport(inspections, companies, staff, startDate, endDate) {
        const filteredInspections = inspections.filter(inspection =>
            inspection.date >= startDate && inspection.date <= endDate
        );

        const totalInspections = filteredInspections.length;
        const totalCompaniesInspected = filteredInspections.reduce((sum, inspection) => sum + inspection.totalCompanies, 0);
        const totalStaffDeployed = filteredInspections.reduce((sum, inspection) => sum + inspection.totalStaff, 0);

        // 按企业类型统计
        const byCompanyType = {};
        filteredInspections.forEach(inspection => {
            inspection.companies.forEach(company => {
                if (!byCompanyType[company.companyType]) {
                    byCompanyType[company.companyType] = 0;
                }
                byCompanyType[company.companyType]++;
            });
        });

        // 按人员统计
        const byStaff = {};
        filteredInspections.forEach(inspection => {
            inspection.staffIds.forEach(staffId => {
                const staffMember = staff.find(s => s.id === staffId);
                if (staffMember) {
                    if (!byStaff[staffMember.name]) {
                        byStaff[staffMember.name] = 0;
                    }
                    byStaff[staffMember.name]++;
                }
            });
        });

        return {
            period: `${startDate} 至 ${endDate}`,
            totalInspections,
            totalCompaniesInspected,
            totalStaffDeployed,
            byCompanyType,
            byStaff,
            avgCompaniesPerInspection: totalInspections > 0 ? (totalCompaniesInspected / totalInspections).toFixed(2) : 0,
            avgStaffPerInspection: totalInspections > 0 ? (totalStaffDeployed / totalInspections).toFixed(2) : 0
        };
    }
}

// 创建全局实例
const textAnalyzer = new TextAnalyzer();
