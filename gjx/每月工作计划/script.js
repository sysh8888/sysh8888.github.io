// 每月工作计划备忘录 - 主脚本文件
// 全局变量
let tasks = [];
let currentEditingTask = null;
let draggedTask = null;
let importedData = null;
let selectedExportDay = null;

// PC端头部滚动效果
function initHeaderScrollEffect() {
    // 只在PC端启用
    if (window.innerWidth <= 768) {
        console.log('移动端设备，跳过头部滚动效果');
        return;
    }
    
    const header = document.querySelector('.header');
    if (!header) {
        console.log('未找到头部元素');
        return;
    }
    
    console.log('PC端头部滚动效果已启用');
    
    let lastScrollY = window.scrollY;
    
    function handleScroll() {
        const currentScrollY = window.scrollY;
        
        // 添加或移除滚动样式
        if (currentScrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollY = currentScrollY;
    }
    
    // 节流滚动事件
    let ticking = false;
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
            setTimeout(() => { ticking = false; }, 16); // 约60fps
        }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
    
    // 窗口大小改变时重新初始化
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            header.classList.remove('scrolled');
            console.log('切换到移动端，移除滚动效果');
        } else {
            console.log('切换到PC端，重新启用滚动效果');
        }
    });
}

// 工具函数
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function updateTaskLayout() {
    // 仅在PC端应用布局优化
    if (window.innerWidth > 768) {
        document.querySelectorAll('.task-cell').forEach(cell => {
            const taskCards = cell.querySelectorAll('.task-card');
            const taskCount = taskCards.length;
            
            // 移除之前的布局类
            cell.classList.remove('single-task', 'dual-task', 'multi-task');
            
            // 清除所有任务卡片的行类
            taskCards.forEach(card => {
                card.classList.remove('row-1', 'row-2', 'row-3', 'row-4', 'row-5');
            });
            
            if (taskCount === 1) {
                cell.classList.add('single-task');
            } else if (taskCount === 2) {
                cell.classList.add('dual-task');
            } else if (taskCount > 2) {
                cell.classList.add('multi-task');
                // 按2个一行的规律排列任务
                taskCards.forEach((card, index) => {
                    const rowNumber = Math.floor(index / 2) + 1;
                    card.classList.add(`row-${rowNumber}`);
                });
            }
        });
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = type === 'error' ? 'var(--danger-color)' : 'var(--success-color)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function saveToLocalStorage(taskData = null) {
    const dataToSave = taskData || tasks;
    localStorage.setItem('weeklyTasks', JSON.stringify(dataToSave));
    if (taskData === null) {
        showToast('已自动保存到本地');
    }
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('weeklyTasks');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            tasks = Array.isArray(parsed) ? parsed : [];
            return tasks;
        } catch (error) {
            console.error('解析本地存储数据失败:', error);
            tasks = [];
            return [];
        }
    }
    tasks = [];
    return [];
}

function updateDateDisplay() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('zh-CN', options);
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const weekNumber = Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / 604800000);
    document.getElementById('weekInfo').textContent = `第${weekNumber}周 ${startOfWeek.getMonth()+1}/${startOfWeek.getDate()}-${endOfWeek.getMonth()+1}/${endOfWeek.getDate()}`;
    
    // 高亮今天（排除周日）
    const today = now.getDay() || 7;
    document.querySelectorAll('.day-header').forEach(header => {
        header.classList.remove('today');
        if (parseInt(header.dataset.day) === today && today !== 7) {
            header.classList.add('today');
        }
    });
}

function renderTasks() {
    // 清空所有任务显示
    document.querySelectorAll('.task-card').forEach(card => card.remove());

    // 获取显示/隐藏设置
    const showMorning = localStorage.getItem('showMorning') !== 'false';
    const showAfternoon = localStorage.getItem('showAfternoon') !== 'false';
    const showEvening = localStorage.getItem('showEvening') !== 'false';

    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        
        // 检查时段是否被隐藏
        let shouldShow = true;
        if (task.slot === 'AM' && !showMorning) shouldShow = false;
        if (task.slot === 'PM' && !showAfternoon) shouldShow = false;
        if (task.slot === 'EVENING' && !showEvening) shouldShow = false;
        
        if (shouldShow) {
            const cell = document.querySelector(`[data-day="${task.day}"][data-slot="${task.slot}"]`);
            if (cell) {
                cell.appendChild(taskElement);
            }
        }
    });
    
    // 更新任务布局
    updateTaskLayout();
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task-card ${task.done ? 'done' : ''} ${getPriorityClass(task.priority)}`;
    div.draggable = true;
    div.dataset.taskId = task.id;
    
    div.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 5px;">
            <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''} 
                   onchange="toggleTask('${task.id}')">
            <div style="flex: 1;">
                <div class="task-title">${task.title}</div>
                ${task.start && task.end ? `<div class="task-time">${task.start}-${task.end}</div>` : ''}
                ${task.note ? `<div class="task-note">${task.note}</div>` : ''}
            </div>
        </div>
        <div class="task-actions">
            <button class="delete-btn" onclick="event.stopPropagation(); deleteTask('${task.id}')"><i class="fas fa-trash"></i></button>
        </div>
    `;

    div.addEventListener('dragstart', (e) => {
        draggedTask = task;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => div.classList.add('dragging'), 0);
    });

    div.addEventListener('dragend', () => {
        div.classList.remove('dragging');
        draggedTask = null;
    });

    // 添加触摸拖拽支持
    let touchStartX, touchStartY, isDragging = false, touchTarget = null;
    
    div.addEventListener('touchstart', (e) => {
        if (e.target.classList.contains('task-checkbox') || e.target.classList.contains('delete-btn')) {
            return;
        }
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isDragging = false;
        touchTarget = null;
    }, { passive: false });
    
    div.addEventListener('touchmove', (e) => {
        if (e.target.classList.contains('task-checkbox') || e.target.classList.contains('delete-btn')) {
            return;
        }
        e.preventDefault();
        
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartX);
        const deltaY = Math.abs(touch.clientY - touchStartY);
        
        if (!isDragging && (deltaX > 10 || deltaY > 10)) {
            isDragging = true;
            draggedTask = task;
            div.classList.add('dragging');
            div.style.position = 'fixed';
            div.style.zIndex = '1000';
            div.style.pointerEvents = 'none';
            div.style.opacity = '0.8';
        }
        
        if (isDragging) {
            div.style.left = (touch.clientX - 50) + 'px';
            div.style.top = (touch.clientY - 25) + 'px';
            
            // 查找触摸点下的目标元素
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            if (elementBelow) {
                const taskCell = elementBelow.closest('.task-cell');
                if (taskCell && taskCell !== touchTarget) {
                    if (touchTarget) {
                        touchTarget.classList.remove('drag-over');
                    }
                    touchTarget = taskCell;
                    taskCell.classList.add('drag-over');
                } else if (!taskCell && touchTarget) {
                    touchTarget.classList.remove('drag-over');
                    touchTarget = null;
                }
            }
        }
    }, { passive: false });
    
    div.addEventListener('touchend', (e) => {
        if (isDragging) {
            e.preventDefault();
            
            // 重置样式
            div.style.position = '';
            div.style.zIndex = '';
            div.style.pointerEvents = '';
            div.style.opacity = '';
            div.style.left = '';
            div.style.top = '';
            div.classList.remove('dragging');
            
            if (touchTarget) {
                touchTarget.classList.remove('drag-over');
                
                // 执行拖放操作
                const fakeEvent = {
                    preventDefault: () => {},
                    dataTransfer: {
                        getData: () => task.id
                    }
                };
                drop(fakeEvent, 'grid', touchTarget);
                touchTarget = null;
            }
            
            draggedTask = null;
            isDragging = false;
        } else if (!isDragging) {
            // 如果没有拖拽，则处理点击事件
            if (!e.target.classList.contains('task-checkbox') && 
                !e.target.classList.contains('delete-btn') && 
                !e.target.closest('.delete-btn')) {
                console.log('点击任务，准备编辑：', task);
                editTask(task);
            }
        }
    }, { passive: false });

    // 确保任务卡片可点击（桌面端）
    div.style.cursor = 'pointer';
    div.addEventListener('click', (e) => {
        if (isDragging) return; // 如果正在拖拽，忽略点击
        e.stopPropagation();
        if (!e.target.classList.contains('task-checkbox') && 
            !e.target.classList.contains('delete-btn') && 
            !e.target.closest('.delete-btn')) {
            console.log('点击任务，准备编辑：', task);
            editTask(task);
        }
    });

    return div;
}

function getPriorityClass(priority) {
    switch (priority) {
        case 1: return 'high-priority';
        case 2: return 'medium-priority';
        case 3: return 'low-priority';
        default: return '';
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev, targetType, targetElement = null) {
    ev.preventDefault();
    
    if (!draggedTask) return;

    const cell = targetElement || ev.target.closest('.task-cell');
    if (cell) {
        // 网格间移动，直接更新位置
        draggedTask.day = parseInt(cell.dataset.day);
        draggedTask.slot = cell.dataset.slot;
    }

    renderTasks();
    saveToLocalStorage();
}

// 任务管理函数
function addTask(day, slot) {
    currentEditingTask = null;
    document.getElementById('modalTitle').textContent = '添加任务';
    document.getElementById('taskForm').reset();
    
    // 设置默认时间
    if (slot) {
        const morningRange = localStorage.getItem('morningRange') || '08:00-12:00';
        const afternoonRange = localStorage.getItem('afternoonRange') || '13:00-18:00';
        const eveningRange = localStorage.getItem('eveningRange') || '19:00-23:00';
        
        let startTime, endTime;
        if (slot === 'AM') {
            const times = morningRange.split('-');
            startTime = times[0];
            endTime = times[1];
        } else if (slot === 'PM') {
            const times = afternoonRange.split('-');
            startTime = times[0];
            endTime = times[1];
        } else if (slot === 'EVENING') {
            const times = eveningRange.split('-');
            startTime = times[0];
            endTime = times[1];
        }
        
        if (startTime && endTime) {
            document.getElementById('taskStart').value = startTime;
            document.getElementById('taskEnd').value = endTime;
        }
    }

    // 设置默认优先级
    selectPriority(2);

    // 设置默认日期 - 优先使用传入的day参数，否则使用当天日期
    let defaultDay = day;
    if (!defaultDay) {
        // 如果没有传入day参数，使用当天日期
        const today = new Date();
        defaultDay = today.getDate();
    }
    
    // 根据当前月份天数隐藏超出的日期按钮
    hideExcessDayButtons();
    
    // 清除所有选中状态
    document.querySelectorAll('.weekday-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 选中默认日期
    const weekdayBtn = document.querySelector(`.weekday-btn[data-day="${defaultDay}"]`);
    if (weekdayBtn) {
        weekdayBtn.classList.add('active');
        console.log('已选中日期按钮:', defaultDay, weekdayBtn);
    } else {
        console.log('未找到日期按钮:', defaultDay);
    }

    document.getElementById('taskModal').style.display = 'block';
    
    // 存储临时位置信息
    window.tempTaskLocation = { day: defaultDay, slot };
}

function editTask(task) {
    console.log('开始编辑任务：', task);
    if (!task) {
        console.error('任务对象为空');
        return;
    }
    currentEditingTask = task;
    document.getElementById('modalTitle').textContent = '编辑任务';
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskStart').value = task.start || '';
    document.getElementById('taskEnd').value = task.end || '';
    document.getElementById('taskNote').value = task.note || '';
    selectPriority(task.priority || 2);
    
    // 重置日期选择
    document.querySelectorAll('.weekday-btn[data-day="1"], .weekday-btn[data-day="2"], .weekday-btn[data-day="3"], .weekday-btn[data-day="4"], .weekday-btn[data-day="5"], .weekday-btn[data-day="6"], .weekday-btn[data-day="7"], .weekday-btn[data-day="8"], .weekday-btn[data-day="9"], .weekday-btn[data-day="10"], .weekday-btn[data-day="11"], .weekday-btn[data-day="12"], .weekday-btn[data-day="13"], .weekday-btn[data-day="14"], .weekday-btn[data-day="15"], .weekday-btn[data-day="16"], .weekday-btn[data-day="17"], .weekday-btn[data-day="18"], .weekday-btn[data-day="19"], .weekday-btn[data-day="20"], .weekday-btn[data-day="21"], .weekday-btn[data-day="22"], .weekday-btn[data-day="23"], .weekday-btn[data-day="24"], .weekday-btn[data-day="25"], .weekday-btn[data-day="26"], .weekday-btn[data-day="27"], .weekday-btn[data-day="28"], .weekday-btn[data-day="29"], .weekday-btn[data-day="30"], .weekday-btn[data-day="31"], .weekday-btn[data-day="all"]').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 如果任务有日期信息，选中对应的日期
    if (task.day) {
        const dayBtn = document.querySelector(`.weekday-btn[data-day="${task.day}"]`);
        if (dayBtn) {
            dayBtn.classList.add('active');
        }
    }
    
    console.log('打开模态框');
    const modal = document.getElementById('taskModal');
    modal.style.display = 'block';
    modal.style.zIndex = '10000'; // 确保模态框在最上层
    
    // 确保模态框可见
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

// 根据时间自动判断时间段
function getTimeSlotByTime(timeStr) {
    if (!timeStr) return 'AM';
    
    const hour = parseInt(timeStr.split(':')[0]);
    
    if (hour >= 6 && hour < 12) {
        return 'AM';  // 上午：6:00-11:59
    } else if (hour >= 12 && hour < 18) {
        return 'PM';  // 下午：12:00-17:59
    } else {
        return 'EVENING';  // 晚上：18:00-5:59
    }
}

function saveTask(event) {
    event.preventDefault();
    
    const title = document.getElementById('taskTitle').value.trim();
    if (!title) {
        showToast('请输入任务标题', 'error');
        return;
    }
    
    const start = document.getElementById('taskStart').value;
    const end = document.getElementById('taskEnd').value;
    const note = document.getElementById('taskNote').value;
    const priority = parseInt(document.querySelector('.priority-btn.active').dataset.priority);
    
    if (currentEditingTask) {
        // 编辑现有任务
        currentEditingTask.title = title;
        currentEditingTask.start = start;
        currentEditingTask.end = end;
        currentEditingTask.note = note;
        currentEditingTask.priority = priority;
    } else {
        // 创建新任务 - 按月布局
        // 优先检查用户手动选择的日期
        const selectedDays = getSelectedWeekdays();
        console.log('选中的日期:', selectedDays);
        // 根据开始时间自动判断时间段，如果没有开始时间则使用界面选择的时间段
        const autoSlot = getTimeSlotByTime(start);
        const selectedSlot = autoSlot || document.querySelector('.time-slot-btn.active')?.dataset.slot || 'AM';
        const location = window.tempTaskLocation;
        console.log('临时位置信息:', location);
        
        if (selectedDays.length > 0) {
            // 用户手动选择了日期，优先使用选中的日期
            selectedDays.forEach(day => {
                const newTask = {
                    id: generateId(),
                    title,
                    start,
                    end,
                    note,
                    priority,
                    done: false,
                    doneAt: null,
                    day: day,
                    slot: selectedSlot,
                    order: Date.now()
                };
                tasks.push(newTask);
            });
        } else if (location && location.day && location.slot) {
            // 没有手动选择日期，使用点击位置信息
            const newTask = {
                id: generateId(),
                title,
                start,
                end,
                note,
                priority,
                done: false,
                doneAt: null,
                day: location.day,
                slot: location.slot,
                order: Date.now()
            };
            tasks.push(newTask);
        } else {
            // 没有选中日期，默认添加到第1天上午
            const newTask = {
                id: generateId(),
                title,
                start,
                end,
                note,
                priority,
                done: false,
                doneAt: null,
                day: 1,
                slot: 'AM',
                order: Date.now()
            };
            tasks.push(newTask);
        }
    }

    renderTasks();
    saveToLocalStorage();
    closeModal();
    showToast('任务保存成功', 'success');
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.done = !task.done;
        task.doneAt = task.done ? new Date().toISOString() : null;
        renderTasks();
        saveToLocalStorage();
    }
}

let taskToDelete = null;

function deleteTask(taskId) {
    taskToDelete = taskId;
    document.getElementById('deleteConfirmModal').style.display = 'block';
}

function closeDeleteConfirmModal() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
    taskToDelete = null;
}

function confirmDeleteTask() {
    if (taskToDelete) {
        tasks = tasks.filter(t => t.id !== taskToDelete);
        renderTasks();
        saveToLocalStorage();
        showToast('任务已删除');
        closeDeleteConfirmModal();
    }
}

function selectPriority(priority) {
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-priority="${priority}"]`).classList.add('active');
}

function toggleWeekday(day) {
    const btn = document.querySelector(`.weekday-btn[data-day="${day}"]`);
    btn.classList.toggle('active');
}

function toggleAllWeekdays() {
    const allBtn = document.querySelector('.weekday-btn[data-day="all"]');
    const isAllSelected = allBtn.classList.contains('active');
    
    // 获取当前月份的天数
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    
    if (isAllSelected) {
        // 取消全选
        allBtn.classList.remove('active');
        // 取消选中当月所有天数
        for (let i = 1; i <= daysInMonth; i++) {
            const btn = document.querySelector(`.weekday-btn[data-day="${i}"]`);
            if (btn) btn.classList.remove('active');
        }
    } else {
        // 全选
        allBtn.classList.add('active');
        // 选中当月所有天数
        for (let i = 1; i <= daysInMonth; i++) {
            const btn = document.querySelector(`.weekday-btn[data-day="${i}"]`);
            if (btn) btn.classList.add('active');
        }
    }
}

function getSelectedWeekdays() {
    const selectedBtns = document.querySelectorAll('.weekday-btn.active:not([data-day="all"])');
    const selectedDays = Array.from(selectedBtns).map(btn => parseInt(btn.dataset.day));
    console.log('getSelectedWeekdays 找到的按钮:', selectedBtns);
    console.log('getSelectedWeekdays 返回的日期:', selectedDays);
    return selectedDays;
}

function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
    currentEditingTask = null;
    window.tempTaskLocation = null;
    
    // 重置星期选择
    document.querySelectorAll('.weekday-btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

function clearWeek() {
    showClearMonthModal();
}

// 显示清空本月数据确认弹窗
function showClearMonthModal() {
    document.getElementById('clearMonthConfirmModal').style.display = 'block';
}

// 关闭清空本月数据确认弹窗
function closeClearMonthModal() {
    document.getElementById('clearMonthConfirmModal').style.display = 'none';
}

// 确认清空本月数据
function confirmClearMonth() {
    tasks = [];
    renderTasks();
    saveToLocalStorage();
    showToast('已清空本月任务');
    closeClearMonthModal();
}

function loadSampleData() {
    if (confirm('加载示例数据会覆盖当前所有任务，确定继续吗？')) {
        tasks = [
            {
                id: generateId(),
                title: '晨间会议',
                start: '09:00',
                end: '09:30',
                note: '周例会，讨论本周工作计划',
                priority: 1,
                done: false,
                weekday: 1,
                slot: 'AM',
                order: 1
            },
            {
                id: generateId(),
                title: '项目开发',
                start: '14:00',
                end: '17:00',
                note: '完成新功能开发',
                priority: 2,
                done: false,
                weekday: 2,
                slot: 'PM',
                order: 2
            },
            {
                id: generateId(),
                title: '健身运动',
                start: '19:00',
                end: '20:00',
                note: '跑步30分钟',
                priority: 3,
                done: false,
                weekday: 3,
                slot: 'EVENING',
                order: 3
            }
        ];
        renderTasks();
        saveToLocalStorage();
        showToast('已加载示例数据');
    }
}

// Excel导入导出功能
function exportToExcel() {
    const tasks = loadFromLocalStorage() || [];
    
    // 扩展CSV格式定义，包含所有任务属性
    const CSV_HEADERS = ['日期', '时段', '任务标题', '开始时间', '结束时间', '优先级', '是否完成', '备注', '重复类型', '选定日期', '任务ID'];
    
    // 映射表 - 统一标准
    const DAY_MAP = {
        1: '1日', 2: '2日', 3: '3日', 4: '4日', 5: '5日', 6: '6日', 7: '7日',
        8: '8日', 9: '9日', 10: '10日', 11: '11日', 12: '12日', 13: '13日', 14: '14日',
        15: '15日', 16: '16日', 17: '17日', 18: '18日', 19: '19日', 20: '20日',
        21: '21日', 22: '22日', 23: '23日', 24: '24日', 25: '25日', 26: '26日',
        27: '27日', 28: '28日', 29: '29日', 30: '30日', 31: '31日'
    };
    
    const SLOT_MAP = {
        'AM': '上午', 'PM': '下午', 'EVENING': '晚上'
    };
    
    const PRIORITY_MAP = {
        1: '高', 2: '中', 3: '低'
    };
    
    const REPEAT_TYPE_MAP = {
        'once': '单次', 'daily': '每天', 'weekly': '每周'
    };
    
    // 构建CSV数据
    const csvData = [CSV_HEADERS];
    
    // 确保tasks是数组并过滤有效任务
    const taskArray = Array.isArray(tasks) ? tasks : [];
    const validTasks = taskArray.filter(task => 
        task && 
        typeof task === 'object' &&
        task.title && task.title.trim() !== ''
    );
    
    // 转换任务数据
    validTasks.forEach(task => {
        // 处理选定日期
        let selectedDaysText = '';
        if (task.selectedWeekdays && Array.isArray(task.selectedWeekdays) && task.selectedWeekdays.length > 0) {
            selectedDaysText = task.selectedWeekdays.map(day => DAY_MAP[day] || day).join(',');
        }
        
        csvData.push([
            DAY_MAP[task.day] || '',
            SLOT_MAP[task.slot] || '',
            task.title || '',
            task.start || '',
            task.end || '',
            PRIORITY_MAP[task.priority] || '中',
            task.done ? '是' : '否',
            task.note || '',
            REPEAT_TYPE_MAP[task.repeatType] || '单次',
            selectedDaysText,
            task.id || ''
        ]);
    });
    
    // 生成CSV内容
    const csvContent = csvData.map(row => 
        row.map(cell => {
            const str = String(cell || '');
            // 处理需要引号的字段
            if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        }).join(',')
    ).join('\r\n');
    
    // 创建并下载文件 - 添加UTF-8 BOM以确保Office兼容性
    const blob = new Blob(['\uFEFF' + csvContent], { 
        type: 'text/csv;charset=utf-8;'
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `monthly_tasks_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`成功导出 ${validTasks.length} 个任务`);
}

function showImportModal() {
    const modal = document.getElementById('importModal');
    modal.style.display = 'block';
    modal.style.zIndex = '10001'; // 确保导入模态框在最上层
    document.getElementById('importPreview').style.display = 'none';
    
    // 确保模态框可见
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

function closeImportModal() {
    document.getElementById('importModal').style.display = 'none';
    importedData = null;
    
    // 清空文件输入框，允许用户再次选择同一个文件
    document.getElementById('fileInput').value = '';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('importPreview').style.display = 'none';
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        // 显示文件信息
        document.getElementById('fileInfo').style.display = 'block';
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = formatFileSize(file.size);
        
        parseExcelFile(file);
    }
}

function clearFile() {
    document.getElementById('fileInput').value = '';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('importPreview').style.display = 'none';
    importedData = null;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 统一CSV解析函数
function parseCSVLine(line) {
    const cells = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i += 2;
            } else {
                inQuotes = !inQuotes;
                i++;
            }
        } else if (char === ',' && !inQuotes) {
            cells.push(current);
            current = '';
            i++;
        } else {
            current += char;
            i++;
        }
    }
    
    cells.push(current);
    return cells;
}

function parseExcelFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        let text = e.target.result;
        
        // 处理编码问题 - 自动检测和修复
        try {
            // 检测BOM标记
            if (text.charCodeAt(0) === 0xFEFF || text.charCodeAt(0) === 0xFFFE) {
                text = text.slice(1);
            }
            
            // 检测乱码并尝试修复
            if (/[]/.test(text) || /\x00/.test(text)) {
                console.warn('检测到编码问题，尝试重新读取...');
                // 这里可以添加GBK解码逻辑，但浏览器原生不支持
                // 提示用户使用UTF-8编码的文件
                showToast('文件编码可能有问题，请确保使用UTF-8编码保存CSV文件', 'warning');
            }
        } catch (encodingError) {
            console.warn('编码处理失败:', encodingError);
        }
        
        const lines = text.replace(/\r\n/g, '\n').split('\n');
        const newTasks = [];
        
        // 日期映射表 - 支持1-31日
        const DAY_MAP = {
            // 中文格式
            '1日': 1, '2日': 2, '3日': 3, '4日': 4, '5日': 5, '6日': 6, '7日': 7,
            '8日': 8, '9日': 9, '10日': 10, '11日': 11, '12日': 12, '13日': 13, '14日': 14,
            '15日': 15, '16日': 16, '17日': 17, '18日': 18, '19日': 19, '20日': 20,
            '21日': 21, '22日': 22, '23日': 23, '24日': 24, '25日': 25, '26日': 26,
            '27日': 27, '28日': 28, '29日': 29, '30日': 30, '31日': 31,
            // 数字格式
            '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
            '8': 8, '9': 9, '10': 10, '11': 11, '12': 12, '13': 13, '14': 14,
            '15': 15, '16': 16, '17': 17, '18': 18, '19': 19, '20': 20,
            '21': 21, '22': 22, '23': 23, '24': 24, '25': 25, '26': 26,
            '27': 27, '28': 28, '29': 29, '30': 30, '31': 31,
        };
        
        // 增强的时段映射
        const SLOT_MAP = {
            '上午': 'AM', '下午': 'PM', '晚上': 'EVENING',
            'AM': 'AM', 'PM': 'PM', 'EVENING': 'EVENING',
            'am': 'AM', 'pm': 'PM', 'evening': 'EVENING',
            'morning': 'AM', 'afternoon': 'PM', 'night': 'EVENING',
            '早': 'AM', '午': 'PM', '晚': 'EVENING'
        };
        
        // 优先级映射
        const PRIORITY_MAP = {
            '高': 1, '中': 2, '低': 3,
            'high': 1, 'medium': 2, 'low': 3,
            '1': 1, '2': 2, '3': 3,
            '紧急': 1, '一般': 2, '普通': 3
        };
        
        // 完成状态映射
        const COMPLETION_MAP = {
            '是': true, '否': false,
            'true': true, 'false': false,
            '1': true, '0': false,
            'yes': true, 'no': false,
            '已完成': true, '未完成': false,
            '完成': true, '未完成': false
        };
        
        const REPEAT_TYPE_MAP = {
            '单次': 'once', '每天': 'daily', '每周': 'weekly',
            'once': 'once', 'daily': 'daily', 'weekly': 'weekly',
            '一次': 'once', '每日': 'daily', '每周': 'weekly'
        };
        
        // 智能检测数据起始行
        let dataStartRow = 1;
        let headerFound = false;
        
        for (let i = 0; i < Math.min(10, lines.length); i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('星期') || lowerLine.includes('weekday') || 
                lowerLine.includes('星期') || lowerLine.includes('标题')) {
                dataStartRow = i + 1;
                headerFound = true;
                break;
            }
        }
        
        // 处理数据行
        for (let i = dataStartRow; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line === '' || line.match(/^,+$/)) continue;
            
            try {
                // 解析CSV行
                const cells = parseCSVLine(line);
                if (!cells || cells.length < 7) {
                    console.warn(`跳过第 ${i + 1} 行: 列数不足`);
                    continue;
                }
                
                // 清理数据 - 更智能的清理
                const cleanCells = cells.map(cell => 
                    cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"')
                ).filter(cell => cell !== '');
                
                if (cleanCells.length < 3) {
                    console.warn(`跳过第 ${i + 1} 行: 数据列数不足`);
                    continue;
                }
                
                // 智能字段提取 - 支持灵活的列顺序
                let dayText = '1日';
                let slotText = '上午';
                let title = '';
                let start = '';
                let end = '';
                let priorityText = '中';
                let completionText = '否';
                let note = '';
                
                // 根据CSV标准格式智能分配字段
                // 标准格式：日期,时段,任务标题,开始时间,结束时间,优先级,是否完成,备注,重复类型,选定日期,任务ID
                if (cleanCells.length >= 3) {
                    dayText = cleanCells[0] || '1日';
                    slotText = cleanCells[1] || '上午';
                    title = cleanCells[2] || '';
                    
                    if (cleanCells.length > 3) start = cleanCells[3] || '';
                    if (cleanCells.length > 4) end = cleanCells[4] || '';
                    if (cleanCells.length > 5) priorityText = cleanCells[5] || '中';
                    if (cleanCells.length > 6) completionText = cleanCells[6] || '否';
                    if (cleanCells.length > 7) note = cleanCells[7] || '';  // 修复：备注字段在第8列（索引7）
                }
                
                // 跳过空标题或无效数据
                if (!title || title.trim() === '' || title === '标题' || title.toLowerCase() === 'title') {
                    continue;
                }
                
                // 智能日期映射
                let day = 1;
                const dayKey = dayText.toString().trim();
                
                if (DAY_MAP[dayKey] !== undefined) {
                    day = DAY_MAP[dayKey];
                } else {
                    // 尝试数字转换
                    const numDay = parseInt(dayKey);
                    if (!isNaN(numDay) && numDay >= 1 && numDay <= 31) {
                        day = numDay;
                    } else {
                        console.warn(`无法识别的日期: ${dayKey}, 默认设为1日`);
                    }
                }
                
                // 智能时段映射
                const slotKey = slotText.toString().trim();
                const slot = SLOT_MAP[slotKey] || 'AM';
                
                // 创建任务对象
                const task = {
                    id: generateId(),
                    title: title.trim(),
                    start: start.trim(),
                    end: end.trim(),
                    priority: PRIORITY_MAP[priorityText.toString().toLowerCase()] || 2,
                    done: COMPLETION_MAP[completionText.toString().toLowerCase()] || false,
                    note: note.trim(),
                    day: day,
                    slot: slot,
                    order: Date.now() + i * 1000,
                    repeatType: 'once',
                    selectedWeekdays: [],
                    doneAt: null
                };
                
                newTasks.push(task);
                
            } catch (error) {
                console.warn(`解析第 ${i + 1} 行失败:`, error.message);
            }
        }
        
        if (newTasks.length > 0) {
            importedData = newTasks;
            document.getElementById('taskCount').textContent = newTasks.length;
            
            // 显示预览
            const previewList = document.getElementById('previewList');
            if (previewList) {
                const slots = { AM: '上午', PM: '下午', EVENING: '晚上' };
                const weekdays = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
                const priorityColors = { 1: '#ff5252', 2: '#ffa726', 3: '#66bb6a' };
                const repeatTypes = { 'once': '单次', 'daily': '每天', 'weekly': '每周' };
                
                previewList.innerHTML = newTasks.slice(0, 10).map(task => 
                    `<div style="padding: 15px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 12px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f8f9ff'" onmouseout="this.style.backgroundColor=''">
                        <div style="width: 4px; height: 40px; border-radius: 2px; background: ${priorityColors[task.priority]}; flex-shrink: 0;"></div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--text-color); margin-bottom: 4px;">${task.title}</div>
                            <div style="font-size: 13px; color: var(--text-light);">
                                ${task.day ? task.day + '日' : ''} • 
                                ${slots[task.slot] || '未知时段'} • 
                                ${task.start} - ${task.end} • 
                                ${repeatTypes[task.repeatType] || '单次'}
                            </div>
                        </div>
                        <div style="font-size: 12px; color: ${priorityColors[task.priority]}; font-weight: 500;">
                            ${task.priority === 1 ? '高' : task.priority === 2 ? '中' : '低'}优先级
                        </div>
                    </div>`
                ).join('');
                
                if (newTasks.length > 10) {
                    previewList.innerHTML += `
                        <div style="padding: 20px; text-align: center; color: var(--text-light); font-size: 14px;">
                            📈 还有 <strong style="color: var(--primary-color);">${newTasks.length - 10}</strong> 个任务未显示
                        </div>`;
                }
            }
            
            document.getElementById('importPreview').style.display = 'block';
            document.getElementById('confirmImportBtn').disabled = false;
        } else {
            showToast('未找到有效任务数据，请检查CSV格式', 'error');
        }
    };
    
    reader.onerror = function() {
        showToast('文件读取失败，请重试', 'error');
    };
    
    reader.readAsText(file, 'UTF-8');
}

function confirmImport() {
    if (!importedData || !Array.isArray(importedData) || importedData.length === 0) {
        showToast('没有可导入的数据', 'error');
        return;
    }
    
    try {
        // 获取现有任务
        const currentTasks = loadFromLocalStorage() || [];
        const currentTaskArray = Array.isArray(currentTasks) ? currentTasks : [];
        
        // 处理导入的任务，确保数据完整性
        const processedTasks = importedData.map(task => {
            const processedTask = {
                id: task.id || generateId(),
                title: task.title || '',
                start: task.start || '',
                end: task.end || '',
                priority: task.priority || 2,
                done: task.done || false,
                note: task.note || '',
                day: task.day || 1,  // 修复：添加缺失的day字段
                weekday: task.weekday,
                slot: task.slot || 'AM',
                order: task.order || Date.now(),
                repeatType: task.repeatType || 'once',
                selectedWeekdays: task.selectedWeekdays || [],
                doneAt: task.doneAt || null
            };
            
            return processedTask;
        });
        
        // 智能重复检测函数
        function isDuplicateTask(newTask, existingTask) {
            // 基于关键属性判断是否为重复任务
            const sameTitle = newTask.title.trim().toLowerCase() === existingTask.title.trim().toLowerCase();
            const sameDay = newTask.day === existingTask.day;
            const sameSlot = newTask.slot === existingTask.slot;
            const sameStartTime = newTask.start === existingTask.start;
            const sameEndTime = newTask.end === existingTask.end;
            
            // 如果标题、日期、时段、开始时间、结束时间都相同，则认为是重复任务
            return sameTitle && sameDay && sameSlot && sameStartTime && sameEndTime;
        }
        
        // 分离新任务和重复任务
        const newTasks = [];
        const duplicateTasks = [];
        
        for (const newTask of processedTasks) {
            let isDuplicate = false;
            
            // 检查是否与现有任务重复
            for (const existingTask of currentTaskArray) {
                if (isDuplicateTask(newTask, existingTask)) {
                    isDuplicate = true;
                    duplicateTasks.push({
                        task: newTask,
                        reason: `与现有任务重复：${existingTask.title} (${existingTask.day}日 ${existingTask.slot})`
                    });
                    break;
                }
            }
            
            // 检查是否与本次导入的其他任务重复
            if (!isDuplicate) {
                for (const otherNewTask of newTasks) {
                    if (isDuplicateTask(newTask, otherNewTask)) {
                        isDuplicate = true;
                        duplicateTasks.push({
                            task: newTask,
                            reason: `与本次导入的其他任务重复：${otherNewTask.title} (${otherNewTask.day}日 ${otherNewTask.slot})`
                        });
                        break;
                    }
                }
            }
            
            if (!isDuplicate) {
                newTasks.push(newTask);
            }
        }
        
        // 合并任务
        const updatedTasks = [...currentTaskArray, ...newTasks];
        
        // 保存到本地存储并更新全局tasks变量
        tasks = updatedTasks;
        saveToLocalStorage(updatedTasks);
        closeImportModal();
        
        // 显示详细的导入结果通知
        const successToast = document.createElement('div');
        successToast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4caf50, #45a049);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(76, 175, 80, 0.3);
            font-size: 16px;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
        `;
        
        // 构建详细的结果信息
        let resultMessage = '';
        if (newTasks.length > 0 && duplicateTasks.length > 0) {
            resultMessage = `成功导入 ${newTasks.length} 个新任务，跳过 ${duplicateTasks.length} 个重复任务`;
        } else if (newTasks.length > 0) {
            resultMessage = `成功导入 ${newTasks.length} 个新任务`;
        } else if (duplicateTasks.length > 0) {
            resultMessage = `所有 ${duplicateTasks.length} 个任务都是重复的，已跳过`;
        } else {
            resultMessage = '没有有效任务可导入';
        }
        
        successToast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px;">${newTasks.length > 0 ? '✨' : '⚠️'}</span>
                <div>
                    <div style="font-weight: 600;">${newTasks.length > 0 ? '导入完成！' : '导入完成'}</div>
                    <div style="font-size: 14px; opacity: 0.9;">${resultMessage}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(successToast);
        setTimeout(() => {
            successToast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => successToast.remove(), 300);
        }, 3000);
        
        renderTasks();
        
        // 清空导入数据
        importedData = null;
        
    } catch (error) {
        console.error('导入失败:', error);
        showToast('导入失败，请重试', 'error');
    }
}

// 设置功能
function showSettingsModal() {
    document.getElementById('settingsModal').style.display = 'block';
    loadSettings();
}

function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // 更新主题按钮状态
    document.querySelectorAll('.theme-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

function loadSettings() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // 高亮当前主题按钮
    const themeBtns = document.querySelectorAll('.theme-btn');
    if (savedTheme === 'light' && themeBtns[0]) themeBtns[0].classList.add('active');
    if (savedTheme === 'dark' && themeBtns[1]) themeBtns[1].classList.add('active');
    if (savedTheme === 'green' && themeBtns[2]) themeBtns[2].classList.add('active');
    
    // 加载时段设置
    const morningRange = localStorage.getItem('morningRange') || '08:00-12:00';
    const afternoonRange = localStorage.getItem('afternoonRange') || '13:00-18:00';
    const eveningRange = localStorage.getItem('eveningRange') || '19:00-23:00';

    // 加载显示/隐藏设置 - 上午和下午为必选
    const showMorning = true; // 上午时段必选
    const showAfternoon = true; // 下午时段必选
    const showEvening = localStorage.getItem('showEvening') !== 'false';
    const showMorningLabel = localStorage.getItem('showMorningLabel') !== 'false';
    const showAfternoonLabel = localStorage.getItem('showAfternoonLabel') !== 'false';
    const showEveningLabel = localStorage.getItem('showEveningLabel') !== 'false';
    const showMobileTimeRange = localStorage.getItem('showMobileTimeRange') !== 'false';
    
    // 解析并设置上午时段
    const morningTimes = morningRange.split('-');
    if (morningTimes.length === 2) {
        document.getElementById('morningStart').value = morningTimes[0];
        document.getElementById('morningEnd').value = morningTimes[1];
    }
    
    // 解析并设置下午时段
    const afternoonTimes = afternoonRange.split('-');
    if (afternoonTimes.length === 2) {
        document.getElementById('afternoonStart').value = afternoonTimes[0];
        document.getElementById('afternoonEnd').value = afternoonTimes[1];
    }
    
    // 解析并设置晚上时段
    const eveningTimes = eveningRange.split('-');
    if (eveningTimes.length === 2) {
        document.getElementById('eveningStart').value = eveningTimes[0];
        document.getElementById('eveningEnd').value = eveningTimes[1];
    }
    
    // 设置显示/隐藏复选框 - 上午和下午强制选中
    document.getElementById('showMorning').checked = true;
    document.getElementById('showAfternoon').checked = true;
    document.getElementById('showEvening').checked = showEvening;
    document.getElementById('showMorningLabel').checked = showMorningLabel;
    document.getElementById('showAfternoonLabel').checked = showAfternoonLabel;
    document.getElementById('showEveningLabel').checked = showEveningLabel;
    document.getElementById('showMobileTimeRange').checked = showMobileTimeRange;
    
    // 应用时段显示设置
    updateTimeLabels();
}

function updateTimeLabels() {
    const morningRange = localStorage.getItem('morningRange') || '08:00-12:00';
    const afternoonRange = localStorage.getItem('afternoonRange') || '13:00-18:00';
    const eveningRange = localStorage.getItem('eveningRange') || '19:00-23:00';
    
    const showMorning = localStorage.getItem('showMorning') !== 'false';
    const showAfternoon = localStorage.getItem('showAfternoon') !== 'false';
    const showEvening = localStorage.getItem('showEvening') !== 'false';
    const showMorningLabel = localStorage.getItem('showMorningLabel') !== 'false';
    const showAfternoonLabel = localStorage.getItem('showAfternoonLabel') !== 'false';
    const showEveningLabel = localStorage.getItem('showEveningLabel') !== 'false';
    const showMobileTimeRange = localStorage.getItem('showMobileTimeRange') !== 'false';
    
    const timeLabels = document.querySelectorAll('.time-label');
    const timeSlotHeaders = document.querySelectorAll('.time-slot-header');
    const weeklyGrid = document.querySelector('.weekly-grid');
    
    // 更新上午时段
    if (timeLabels[0]) {
        timeLabels[0].style.display = showMorning ? '' : 'none';
        const desktopText = timeLabels[0].querySelector('.desktop-text');
        if (desktopText) {
            desktopText.innerHTML = showMorningLabel ? `上午<br>${morningRange}` : '上午';
        }
        
        // 隐藏对应的任务单元格
        const morningCells = document.querySelectorAll('[data-slot="AM"]');
        morningCells.forEach(cell => {
            cell.style.display = showMorning ? '' : 'none';
        });
    }
    
    // 更新PC端上午时段标题
    if (timeSlotHeaders[1]) {
        timeSlotHeaders[1].style.display = showMorning ? '' : 'none';
        const timeSlotName = timeSlotHeaders[1].querySelector('.time-slot-name');
        const timeSlotRange = timeSlotHeaders[1].querySelector('.time-slot-range');
        if (timeSlotName) {
            timeSlotName.textContent = '上午';
        }
        if (timeSlotRange && showMorningLabel) {
            timeSlotRange.textContent = morningRange;
            timeSlotRange.style.display = 'block';
        } else if (timeSlotRange) {
            timeSlotRange.style.display = 'none';
        }
    }
    
    // 更新下午时段
    if (timeLabels[1]) {
        timeLabels[1].style.display = showAfternoon ? '' : 'none';
        const desktopText = timeLabels[1].querySelector('.desktop-text');
        if (desktopText) {
            desktopText.innerHTML = showAfternoonLabel ? `下午<br>${afternoonRange}` : '下午';
        }
        
        // 隐藏对应的任务单元格
        const afternoonCells = document.querySelectorAll('[data-slot="PM"]');
        afternoonCells.forEach(cell => {
            cell.style.display = showAfternoon ? '' : 'none';
        });
    }
    
    // 更新PC端下午时段标题
    if (timeSlotHeaders[2]) {
        timeSlotHeaders[2].style.display = showAfternoon ? '' : 'none';
        const timeSlotName = timeSlotHeaders[2].querySelector('.time-slot-name');
        const timeSlotRange = timeSlotHeaders[2].querySelector('.time-slot-range');
        if (timeSlotName) {
            timeSlotName.textContent = '下午';
        }
        if (timeSlotRange && showAfternoonLabel) {
            timeSlotRange.textContent = afternoonRange;
            timeSlotRange.style.display = 'block';
        } else if (timeSlotRange) {
            timeSlotRange.style.display = 'none';
        }
    }
    
    // 更新晚上时段
    if (timeLabels[2]) {
        if (window.innerWidth <= 480) {
            // 手机端：使用强制的display:none确保兼容性
            // 晚上列相关元素：表头data-day="3" + 所有data-slot="EVENING"的任务单元格
            const eveningColumn = [
                document.querySelector('.day-header[data-day="3"]'),
                ...document.querySelectorAll('[data-slot="EVENING"]')
            ];
            
            eveningColumn.forEach(element => {
                if (element) {
                    if (showEvening) {
                        element.classList.remove('mobile-hidden');
                        element.style.display = '';
                    } else {
                        element.classList.add('mobile-hidden');
                        element.style.display = 'none !important';
                    }
                }
            });
        } else {
            // 桌面端：使用showEvening控制时间段显示
            timeLabels[2].style.display = showEvening ? '' : 'none';
            const eveningCells = document.querySelectorAll('[data-slot="EVENING"]');
            eveningCells.forEach(cell => {
                cell.style.display = showEvening ? '' : 'none';
            });
        }
        
        const desktopText = timeLabels[2].querySelector('.desktop-text');
        if (desktopText) {
            desktopText.innerHTML = showEveningLabel ? `晚上<br>${eveningRange}` : '晚上';
        }
    }
    
    // 更新PC端晚上时段标题
    if (timeSlotHeaders[3]) {
        timeSlotHeaders[3].style.display = showEvening ? '' : 'none';
        const timeSlotName = timeSlotHeaders[3].querySelector('.time-slot-name');
        const timeSlotRange = timeSlotHeaders[3].querySelector('.time-slot-range');
        if (timeSlotName) {
            timeSlotName.textContent = '晚上';
        }
        if (timeSlotRange && showEveningLabel) {
            timeSlotRange.textContent = eveningRange;
            timeSlotRange.style.display = 'block';
        } else if (timeSlotRange) {
            timeSlotRange.style.display = 'none';
        }
    }
    
    // 动态调整网格模板（桌面端和手机端）
    const monthlyGrid = document.querySelector('.monthly-grid');
    if (monthlyGrid) {
        monthlyGrid.classList.remove('evening-hidden', 'evening-visible');
        monthlyGrid.classList.add(showEvening ? 'evening-visible' : 'evening-hidden');
            
            // 强制重新渲染网格布局
        monthlyGrid.style.display = 'none';
        monthlyGrid.offsetHeight; // 触发重排
        monthlyGrid.style.display = 'grid';
    }
    
    if (window.innerWidth <= 480) {
        // 手机端：重新调用toggleWeekendDisplay来更新完整的网格布局
        toggleWeekendDisplay();
        repositionMobileElements(showEvening);
    } else {
        // 桌面端：网格布局已通过CSS类控制
        if (showEveningLabel) {
            // 显示晚上时段：标题行 + 三个时段行
            // monthlyGrid.style.gridTemplateRows = 'auto 1fr 1fr 1fr';
        } else {
            // 隐藏晚上时段：标题行 + 两个时段行（平分空间）
            // monthlyGrid.style.gridTemplateRows = 'auto 1fr 1fr';
        }
    }
    
    // 更新手机端时间范围显示
    updateMobileTimeRanges(morningRange, afternoonRange, eveningRange, showMobileTimeRange);
}

function updateMobileTimeRanges(morningRange, afternoonRange, eveningRange, showMobileTimeRange) {
    // 更新手机端时间范围显示
    const mobileTimeRangeAM = document.getElementById('mobileTimeRangeAM');
    const mobileTimeRangePM = document.getElementById('mobileTimeRangePM');
    const mobileTimeRangeEVENING = document.getElementById('mobileTimeRangeEVENING');
    
    if (mobileTimeRangeAM) {
        mobileTimeRangeAM.textContent = morningRange;
        mobileTimeRangeAM.style.display = showMobileTimeRange ? 'block' : 'none';
    }
    
    if (mobileTimeRangePM) {
        mobileTimeRangePM.textContent = afternoonRange;
        mobileTimeRangePM.style.display = showMobileTimeRange ? 'block' : 'none';
    }
    
    if (mobileTimeRangeEVENING) {
        mobileTimeRangeEVENING.textContent = eveningRange;
        mobileTimeRangeEVENING.style.display = showMobileTimeRange ? 'block' : 'none';
    }
}

function repositionMobileTimeLabels() {
    // 在新的移动端布局中，时间标签已经通过CSS正确定位
    // 这个函数现在主要用于处理隐藏逻辑，CSS已经处理了基本定位
    // 移动端布局：8行（标题+周一到周日）x 4列（时间+上午+下午+晚上）
}

function repositionMobileElements(showEvening) {
    // 只在手机端执行
    if (window.innerWidth > 480) {
        console.log('非手机端，跳过手机端布局调整');
        return;
    }
    
    console.log('开始执行手机端布局调整');
    
    // 使用与PC端完全一致的月份判断逻辑
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    
    console.log(`手机端月份判断：${currentYear}年${currentMonth + 1}月，共${daysInMonth}天`);
    
    // 动态设置手机端网格的行数
    const monthlyGrid = document.querySelector('.monthly-grid');
    if (monthlyGrid) {
        // 设置网格行数：1行表头 + 实际天数行
        if (window.innerWidth <= 480) {
            // 手机端使用较小的行高
            monthlyGrid.style.gridTemplateRows = `40px repeat(${daysInMonth}, 1fr)`;
        } else {
            // 桌面端使用较大的行高
            monthlyGrid.style.gridTemplateRows = `50px repeat(${daysInMonth}, 1fr)`;
        }
    }
    
    // 在按月布局下，处理当前月份的实际天数
    for (let day = 1; day <= daysInMonth; day++) {
        const actualRow = day + 1; // +1 因为第一行是表头
        
        // 设置日期标签位置
        const dayLabel = document.querySelector(`.day-label[data-day="${day}"]`);
        if (dayLabel) {
            dayLabel.style.gridColumn = '1';
            dayLabel.style.gridRow = `${actualRow}`;
            dayLabel.style.display = 'flex'; // 确保显示
        }
        
        // 设置任务单元格位置
        const amCell = document.querySelector(`.task-cell[data-day="${day}"][data-slot="AM"]`);
        if (amCell) {
            amCell.style.gridColumn = '2';
            amCell.style.gridRow = `${actualRow}`;
            amCell.style.display = 'flex'; // 确保显示
            amCell.classList.remove('hidden'); // 移除隐藏类
        }
        
        const pmCell = document.querySelector(`.task-cell[data-day="${day}"][data-slot="PM"]`);
        if (pmCell) {
            pmCell.style.gridColumn = '3';
            pmCell.style.gridRow = `${actualRow}`;
            pmCell.style.display = 'flex'; // 确保显示
            pmCell.classList.remove('hidden'); // 移除隐藏类
        }
        
        const eveningCell = document.querySelector(`.task-cell[data-day="${day}"][data-slot="EVENING"]`);
        if (eveningCell) {
            if (showEvening) {
                eveningCell.style.gridColumn = '4';
                eveningCell.style.gridRow = `${actualRow}`;
                eveningCell.style.display = 'flex';
                eveningCell.classList.remove('hidden'); // 移除隐藏类
            } else {
                // 当晚上时段隐藏时，确保晚上单元格不显示
                eveningCell.style.display = 'none';
                eveningCell.classList.add('hidden');
            }
        }
    }
    
    // 隐藏超出当月天数的日期 - 使用与PC端一致的逻辑
    for (let day = daysInMonth + 1; day <= 31; day++) {
        const dayLabel = document.querySelector(`.day-label[data-day="${day}"]`);
        const taskCells = document.querySelectorAll(`.task-cell[data-day="${day}"]`);
        
        if (dayLabel) {
            dayLabel.style.display = 'none';
        }
        taskCells.forEach(cell => {
            if (cell) {
                cell.classList.add('hidden');
                cell.style.display = 'none'; // 双重保险
            }
        });
    }
    
    console.log(`手机端日期处理完成：显示1-${daysInMonth}日，隐藏${daysInMonth + 1}-31日`);
    
    // 验证隐藏效果
    const testDay = daysInMonth + 1;
    if (testDay <= 31) {
        const testLabel = document.querySelector(`.day-label[data-day="${testDay}"]`);
        const testCells = document.querySelectorAll(`.task-cell[data-day="${testDay}"]`);
        console.log(`验证第${testDay}天隐藏效果：`, {
            label: testLabel ? testLabel.style.display : '未找到',
            cells: testCells.length,
            firstCellHidden: testCells[0] ? testCells[0].classList.contains('hidden') : '无单元格'
        });
    }
}

function toggleWeekendDisplay() {
    // 使用与PC端完全一致的月份判断逻辑
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    
    // 隐藏或显示对应的日期列（按月份自动判定）
    for (let day = 1; day <= 31; day++) {
        const dateColumn = document.querySelector(`.date-column[data-day="${day}"]`);
        const dayLabel = document.querySelector(`.day-label[data-day="${day}"]`);
        const taskCells = document.querySelectorAll(`.task-cell[data-day="${day}"]`);
        
        if (dateColumn && dayLabel) {
            if (day > daysInMonth) {
                dateColumn.style.display = 'none';
                dayLabel.style.display = 'none';
                taskCells.forEach(cell => cell.style.display = 'none');
            } else {
                dateColumn.style.display = 'block';
                dayLabel.style.display = 'block';
                taskCells.forEach(cell => cell.style.display = 'block');
            }
        }
    }
    
    // 更新网格布局
    const grid = document.querySelector('.grid');
    if (grid) {
        const visibleColumns = daysInMonth;
        if (window.innerWidth <= 768) {
            grid.style.gridTemplateColumns = `30px repeat(${visibleColumns}, 1fr)`;
            grid.style.setProperty('grid-template-columns', `30px repeat(${visibleColumns}, 1fr)`, 'important');
        } else {
            grid.style.gridTemplateColumns = `100px repeat(${visibleColumns}, 1fr)`;
        }
    }
    
    // 更新时段列的宽度分配
    updateSlotColumns();
}

function updateSlotColumns() {
    // 检查晚上时段是否应该显示
    const showEvening = localStorage.getItem('showEvening') !== 'false'; // 默认显示
    
    // 获取所有日期列的时段容器
    const slotContainers = document.querySelectorAll('.date-column');
    
    slotContainers.forEach(container => {
        const morningCells = container.querySelectorAll('.task-cell[data-slot="AM"]');
        const afternoonCells = container.querySelectorAll('.task-cell[data-slot="PM"]');
        const eveningCells = container.querySelectorAll('.task-cell[data-slot="EVENING"]');
        
        morningCells.forEach(cell => {
            cell.style.display = 'block';
        });
        
        afternoonCells.forEach(cell => {
            cell.style.display = 'block';
        });
        
        eveningCells.forEach(cell => {
            if (showEvening) {
                cell.style.display = 'block';
                // 三列布局：上午、下午、晚上
                container.style.gridTemplateColumns = 'repeat(3, 1fr)';
            } else {
                cell.style.display = 'none';
                // 两列布局：上午、下午均分
                container.style.gridTemplateColumns = 'repeat(2, 1fr)';
            }
        });
    });
    
    // 更新时段标签
    const eveningLabels = document.querySelectorAll('.time-slot-label[data-slot="EVENING"]');
    eveningLabels.forEach(label => {
        label.style.display = showEvening ? 'block' : 'none';
    });
}

function saveSettings() {
    // 保存时段设置
    const morningStart = document.getElementById('morningStart').value;
    const morningEnd = document.getElementById('morningEnd').value;
    const afternoonStart = document.getElementById('afternoonStart').value;
    const afternoonEnd = document.getElementById('afternoonEnd').value;
    const eveningStart = document.getElementById('eveningStart').value;
    const eveningEnd = document.getElementById('eveningEnd').value;
    
    const morningRange = `${morningStart}-${morningEnd}`;
    const afternoonRange = `${afternoonStart}-${afternoonEnd}`;
    const eveningRange = `${eveningStart}-${eveningEnd}`;
    
    localStorage.setItem('morningRange', morningRange);
    localStorage.setItem('afternoonRange', afternoonRange);
    localStorage.setItem('eveningRange', eveningRange);
    
    // 保存显示/隐藏设置 - 上午和下午强制为true
    localStorage.setItem('showMorning', true);
    localStorage.setItem('showAfternoon', true);
    localStorage.setItem('showEvening', document.getElementById('showEvening').checked);
    localStorage.setItem('showMorningLabel', document.getElementById('showMorningLabel').checked);
    localStorage.setItem('showAfternoonLabel', document.getElementById('showAfternoonLabel').checked);
    localStorage.setItem('showEveningLabel', document.getElementById('showEveningLabel').checked);
    localStorage.setItem('showMobileTimeRange', document.getElementById('showMobileTimeRange').checked);
    
    // 移除周末显示设置
    // localStorage.removeItem('hideSaturday');
    // localStorage.removeItem('hideSunday');
    
    // 应用日期显示设置（按月份自动判定）
    toggleWeekendDisplay();
    
    // 更新时段列宽度分配
    updateSlotColumns();
    
    // 更新时段标签显示和时段可见性
    updateTimeLabels();
    
    // 更新手机端时间范围显示
    const showMobileTimeRange = document.getElementById('showMobileTimeRange').checked;
    updateMobileTimeRanges(morningRange, afternoonRange, eveningRange, showMobileTimeRange);
    
    renderTasks();
    
    showToast('设置已保存');
    closeSettingsModal();
}

// 标题编辑功能
function editTitle() {
    const titleElement = document.getElementById('tableTitle');
    const inputElement = document.getElementById('tableTitleInput');
    
    titleElement.style.display = 'none';
    inputElement.style.display = 'inline-block';
    inputElement.value = titleElement.textContent;
    inputElement.focus();
    inputElement.select();
}

function saveTitle() {
    const titleElement = document.getElementById('tableTitle');
    const inputElement = document.getElementById('tableTitleInput');
    
    const newTitle = inputElement.value.trim();
    if (newTitle) {
        titleElement.textContent = newTitle;
        // 保存到localStorage
        localStorage.setItem('tableTitle', newTitle);
    }
    
    titleElement.style.display = 'inline-block';
    inputElement.style.display = 'none';
}

function handleTitleKeypress(event) {
    if (event.key === 'Enter') {
        saveTitle();
    } else if (event.key === 'Escape') {
        const titleElement = document.getElementById('tableTitle');
        const inputElement = document.getElementById('tableTitleInput');
        
        titleElement.style.display = 'inline-block';
        inputElement.style.display = 'none';
    }
}

function loadTableTitle() {
    const savedTitle = localStorage.getItem('tableTitle');
    if (savedTitle) {
        document.getElementById('tableTitle').textContent = savedTitle;
    }
}

// 获取月份天数
function getDaysInMonth(year, month) {
    // month 是 0-11，所以传入的 month 需要 +1
    return new Date(year, month + 1, 0).getDate();
}

// 根据当前月份天数隐藏任务添加模态框中超出的日期按钮
function hideExcessDayButtons() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    
    console.log(`隐藏超出天数的按钮：当前月份${currentYear}年${currentMonth + 1}月，共${daysInMonth}天`);
    
    // 隐藏超出当月天数的日期按钮
    for (let day = daysInMonth + 1; day <= 31; day++) {
        const dayBtn = document.querySelector(`.weekday-btn[data-day="${day}"]`);
        if (dayBtn) {
            dayBtn.style.display = 'none';
            console.log(`隐藏第${day}天按钮`);
        }
    }
    
    // 显示当月天数范围内的日期按钮
    for (let day = 1; day <= daysInMonth; day++) {
        const dayBtn = document.querySelector(`.weekday-btn[data-day="${day}"]`);
        if (dayBtn) {
            dayBtn.style.display = 'inline-block';
        }
    }
    
    // 确保"每天"按钮始终显示
    const allBtn = document.querySelector('.weekday-btn[data-day="all"]');
    if (allBtn) {
        allBtn.style.display = 'inline-block';
    }
}

// 更新月度网格布局
function updateMonthlyGrid() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    
    console.log(`当前月份：${currentYear}年${currentMonth + 1}月，共${daysInMonth}天`);
    
    const monthlyGrid = document.getElementById('monthlyGrid');
    if (!monthlyGrid) return;
    
    // 更新网格布局
    if (window.innerWidth <= 480) {
        // 手机端使用较小的行高
        monthlyGrid.style.gridTemplateRows = `40px repeat(${daysInMonth}, 1fr)`;
    } else {
        // 桌面端使用较大的行高
        monthlyGrid.style.gridTemplateRows = `60px repeat(${daysInMonth}, 1fr)`;
    }
    
    // 隐藏超出当月天数的日期
    for (let day = 1; day <= 31; day++) {
        const dayLabel = document.querySelector(`[data-day="${day}"].day-label`);
        const taskCells = document.querySelectorAll(`[data-day="${day}"].task-cell`);
        
        if (dayLabel) {
            if (day > daysInMonth) {
                dayLabel.style.display = 'none';
                taskCells.forEach(cell => {
                    if (cell) cell.classList.add('hidden');
                });
            } else {
                dayLabel.style.display = 'flex';
                taskCells.forEach(cell => {
                    if (cell) cell.classList.remove('hidden');
                });
            }
        }
    }
    
    // 高亮今日日期
    const today = now.getDate();
    document.querySelectorAll('.day-label').forEach(label => {
        label.classList.remove('today');
        if (parseInt(label.dataset.day) === today) {
            label.classList.add('today');
        }
    });
    
    // 更新日期显示
    updateDateDisplay();
    
    // 如果是手机端，调用手机端布局调整函数
    if (window.innerWidth <= 480) {
        const showEvening = localStorage.getItem('showEvening') !== 'false';
        repositionMobileElements(showEvening);
    }
}

// 更新日期显示
function updateDateDisplay() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[now.getDay()];
    
    const dateDisplay = document.getElementById('currentDate');
    if (dateDisplay) {
        dateDisplay.textContent = `${year}年${month}月${date}日 ${weekDay}`;
    }
    
    const weekInfo = document.getElementById('weekInfo');
    if (weekInfo) {
        weekInfo.textContent = `${year}年${month}月 - 共${getDaysInMonth(year, month - 1)}天`;
    }
}

// 导出功能相关函数
// 切换导出下拉菜单
function toggleExportDropdown() {
    const dropdown = document.getElementById('exportDropdown');
    const toggle = document.querySelector('.export-dropdown .dropdown-toggle');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        toggle.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        toggle.classList.add('active');
    }
}

// 切换备份下拉菜单
function toggleBackupDropdown() {
    const dropdown = document.getElementById('backupDropdown');
    const toggle = document.querySelector('.backup-dropdown .dropdown-toggle');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        toggle.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        toggle.classList.add('active');
    }
}

// 显示日报导出模态框
function showDailyExportModal() {
    const modal = document.getElementById('dailyExportModal');
    modal.style.display = 'block';
    selectedExportDay = null;
    document.getElementById('exportDailyBtn').disabled = true;
    
    // 动态生成日期按钮
    const selector = document.getElementById('exportDaySelector');
    selector.innerHTML = '';
    
    // 获取当前月份的天数
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = now.getDate();
    
    // 生成1到当月天数的按钮
    for (let day = 1; day <= daysInMonth; day++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'export-day-btn';
        btn.dataset.day = day;
        btn.textContent = `${day}日`;
        btn.onclick = () => selectExportDay(day);
        selector.appendChild(btn);
    }
    
    // 默认选中当天日期
    if (today <= daysInMonth) {
        selectExportDay(today);
    }
    
    // 关闭下拉菜单
    document.getElementById('exportDropdown').classList.remove('show');
    document.querySelector('.dropdown-toggle').classList.remove('active');
}

// 关闭日报导出模态框
function closeDailyExportModal() {
    document.getElementById('dailyExportModal').style.display = 'none';
    selectedExportDay = null;
}

// 选择导出日期
function selectExportDay(day) {
    selectedExportDay = day;
    
    // 更新按钮状态
    const modal = document.getElementById('dailyExportModal');
    modal.querySelectorAll('.export-day-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    const selectedBtn = modal.querySelector(`.export-day-btn[data-day="${day}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    // 启用导出按钮
    document.getElementById('exportDailyBtn').disabled = false;
}

// 导出日报
function exportDailyReport() {
    if (!selectedExportDay) {
        showToast('请先选择要导出的日期', 'error');
        return;
    }

    const tasks = loadFromLocalStorage() || [];
    const slotNames = { 'AM': '上午', 'PM': '下午', 'EVENING': '晚上' };
    const priorityNames = { 1: '高', 2: '中', 3: '低' };

    // 筛选选定日期的任务
    const dayTasks = tasks.filter(task => task.day === selectedExportDay);

    if (dayTasks.length === 0) {
        showToast(`${selectedExportDay}日没有任务数据`, 'error');
        return;
    }

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    
    // 准备数据
    const wsData = [
        ['时段', '任务标题', '开始时间', '结束时间', '优先级', '完成状态', '备注']
    ];

    // 按时段分组并排序
    const timeSlots = ['AM', 'PM', 'EVENING'];
    timeSlots.forEach(slot => {
        const slotTasks = dayTasks.filter(task => task.slot === slot)
            .sort((a, b) => (a.start || '').localeCompare(b.start || ''));
        
        if (slotTasks.length > 0) {
            slotTasks.forEach(task => {
                wsData.push([
                    slotNames[task.slot] || task.slot,
                    task.title || '',
                    task.start || '',
                    task.end || '',
                    priorityNames[task.priority] || '中',
                    task.done ? '已完成' : '未完成',
                    task.note || ''
                ]);
            });
        }
    });

    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // 设置列宽
    ws['!cols'] = [
        { wch: 10 }, // 时段
        { wch: 30 }, // 任务标题
        { wch: 12 }, // 开始时间
        { wch: 12 }, // 结束时间
        { wch: 10 }, // 优先级
        { wch: 12 }, // 完成状态
        { wch: 25 }  // 备注
    ];

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, `${selectedExportDay}日报`);

    // 生成文件名
    const today = new Date();
    const fileName = `${selectedExportDay}日报_${today.getFullYear()}年${(today.getMonth()+1).toString().padStart(2,'0')}月${today.getDate().toString().padStart(2,'0')}日.xlsx`;

    // 导出文件
    XLSX.writeFile(wb, fileName);
    
    showToast(`成功导出${selectedExportDay}日报，共${dayTasks.length}个任务`);
    closeDailyExportModal();
}

// 导出月报
function exportWeeklyReport() {
    const tasks = loadFromLocalStorage() || [];
    const slotNames = { 'AM': '上午', 'PM': '下午', 'EVENING': '晚上' };
    const priorityNames = { 1: '高', 2: '中', 3: '低' };

    // 获取当前月份的天数
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // 筛选本月的任务（1-31日）
    const monthTasks = tasks.filter(task => task.day && task.day >= 1 && task.day <= daysInMonth);

    if (monthTasks.length === 0) {
        showToast('本月没有任务数据', 'error');
        return;
    }

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    
    // 准备数据
    const wsData = [
        ['日期', '时段', '任务标题', '开始时间', '结束时间', '优先级', '完成状态', '备注']
    ];

    // 按日期和时段排序
    for (let day = 1; day <= daysInMonth; day++) {
        const dayTasks = monthTasks.filter(task => task.day === day)
            .sort((a, b) => {
                const slotOrder = { 'AM': 1, 'PM': 2, 'EVENING': 3 };
                if (a.slot !== b.slot) return (slotOrder[a.slot] || 4) - (slotOrder[b.slot] || 4);
                return (a.start || '').localeCompare(b.start || '');
            });
        
        if (dayTasks.length > 0) {
            dayTasks.forEach(task => {
                wsData.push([
                    `${day}日`,
                    slotNames[task.slot] || task.slot,
                    task.title || '',
                    task.start || '',
                    task.end || '',
                    priorityNames[task.priority] || '中',
                    task.done ? '已完成' : '未完成',
                    task.note || ''
                ]);
            });
        }
    }

    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // 设置列宽
    ws['!cols'] = [
        { wch: 12 }, // 日期
        { wch: 10 }, // 时段
        { wch: 30 }, // 任务标题
        { wch: 12 }, // 开始时间
        { wch: 12 }, // 结束时间
        { wch: 10 }, // 优先级
        { wch: 12 }, // 完成状态
        { wch: 25 }  // 备注
    ];

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, `${currentMonth+1}月工作月报`);

    // 生成文件名
    const fileName = `${currentMonth+1}月工作月报_${currentYear}年${(currentMonth+1).toString().padStart(2,'0')}月${today.getDate().toString().padStart(2,'0')}日.xlsx`;

    // 导出文件
    XLSX.writeFile(wb, fileName);
    
    showToast(`成功导出${currentMonth+1}月工作月报，共${monthTasks.length}个任务`);
    
    // 关闭下拉菜单
    document.getElementById('exportDropdown').classList.remove('show');
    document.querySelector('.dropdown-toggle').classList.remove('active');
}

// 初始化函数
function initializeApp() {
    loadFromLocalStorage();
    loadSettings();
    loadTableTitle(); // 加载保存的标题
    
    // 初始化PC端头部滚动效果
    initHeaderScrollEffect();
    
    // 初始化任务添加模态框中的天数按钮显示
    hideExcessDayButtons();
    
    // 初始化手机端网格布局CSS类
    if (window.innerWidth <= 480) {
        const monthlyGrid = document.querySelector('.monthly-grid');
        if (monthlyGrid) {
            monthlyGrid.classList.add('mobile-grid');
        }
    }
    
    // 先更新月度网格，然后处理手机端布局
    updateMonthlyGrid();
    
    // 如果是手机端，确保手机端布局正确应用
    if (window.innerWidth <= 480) {
        const showEvening = localStorage.getItem('showEvening') !== 'false';
        repositionMobileElements(showEvening);
    }
    
    renderTasks(); // 添加任务渲染，确保页面加载时显示任务
    
    // 每分钟更新日期显示
    setInterval(updateMonthlyGrid, 60000);
    
    console.log('页面加载完成，任务数量：', tasks.length);
    console.log('任务列表：', tasks);
}

// 事件监听器
function setupEventListeners() {
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    addTask(1, 'AM');
                    break;
                case 's':
                    e.preventDefault();
                    saveToLocalStorage();
                    break;
                case 'e':
                    e.preventDefault();
                    exportToExcel();
                    break;
            }
        }
    });

    // 全局错误处理
    window.addEventListener('error', function(e) {
        console.error('JavaScript错误：', e.error);
        console.error('错误信息：', e.message);
        console.error('错误位置：', e.filename, '行', e.lineno);
    });

    // 窗口大小变化时重新调整布局
    window.addEventListener('resize', () => {
        toggleWeekendDisplay();
        // 如果切换到手机端，调用手机端布局调整函数
        if (window.innerWidth <= 480) {
            const showEvening = localStorage.getItem('showEvening') !== 'false';
            repositionMobileElements(showEvening);
        }
    });

    // 点击外部关闭下拉菜单
    document.addEventListener('click', function(event) {
        const exportDropdown = document.querySelector('.export-dropdown');
        const backupDropdown = document.querySelector('.backup-dropdown');
        
        if (exportDropdown && !exportDropdown.contains(event.target)) {
            document.getElementById('exportDropdown').classList.remove('show');
            document.querySelector('.export-dropdown .dropdown-toggle').classList.remove('active');
        }
        
        if (backupDropdown && !backupDropdown.contains(event.target)) {
            document.getElementById('backupDropdown').classList.remove('show');
            document.querySelector('.backup-dropdown .dropdown-toggle').classList.remove('active');
        }
    });

    // 点击模态框外部关闭
    window.onclick = function(event) {
        const clearMonthModal = document.getElementById('clearMonthConfirmModal');
        if (event.target === clearMonthModal) {
            closeClearMonthModal();
        }
        const modals = ['taskModal', 'importModal', 'settingsModal', 'dailyExportModal', 'deleteConfirmModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (event.target === modal) {
                if (modalId === 'taskModal') {
                    closeModal();
                } else if (modalId === 'importModal') {
                    closeImportModal();
                } else if (modalId === 'settingsModal') {
                    closeSettingsModal();
                } else if (modalId === 'dailyExportModal') {
                    closeDailyExportModal();
                } else if (modalId === 'deleteConfirmModal') {
                    closeDeleteConfirmModal();
                }
            }
        });
    };
    
    // 监听窗口大小变化，实时调整布局
    window.addEventListener('resize', function() {
        toggleWeekendDisplay();
        updateTaskLayout();
    });
    
    // 页面加载完成后初始化网格布局
    window.addEventListener('load', function() {
        // 确保手机端网格布局正确初始化
        if (window.innerWidth <= 480) {
            toggleWeekendDisplay();
        }
    });
}

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});
