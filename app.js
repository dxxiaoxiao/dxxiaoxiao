/**
 * 待办事项应用的主要JavaScript文件
 * 实现了添加、删除、完成任务以及过滤显示等功能
 */

// 等待DOM完全加载后执行
document.addEventListener('DOMContentLoaded', function() {
    // 显示加载状态
    console.log('ToDoList应用已加载');
    // 获取DOM元素
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const taskCount = document.getElementById('taskCount');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // 当前过滤器状态
    let currentFilter = 'all';
    
    // 从本地存储加载任务
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // 获取加载动画元素
    const loading = document.getElementById('loading');
    
    // 初始化应用
    init();
    
    // 隐藏加载动画
    setTimeout(() => {
        loading.classList.add('hidden');
    }, 500);
    
    /**
     * 初始化应用
     * 渲染任务列表并设置事件监听器
     */
    function init() {
        renderTasks();
        updateTaskCount();
        
        // 添加任务按钮点击事件
        addTaskBtn.addEventListener('click', addTask);
        
        // 输入框回车事件
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTask();
            }
        });
        
        // 清除已完成任务按钮点击事件
        clearCompletedBtn.addEventListener('click', clearCompletedTasks);
        
        // 过滤器按钮点击事件
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // 移除所有过滤器按钮的active类
                filterBtns.forEach(b => b.classList.remove('active'));
                // 为当前点击的按钮添加active类
                this.classList.add('active');
                // 更新当前过滤器状态
                currentFilter = this.getAttribute('data-filter');
                // 重新渲染任务列表
                renderTasks();
            });
        });
    }
    
    /**
     * 添加新任务
     * 从输入框获取任务文本，创建新任务对象并添加到任务列表
     */
    function addTask() {
        // 获取输入框的值并去除首尾空格
        const taskText = taskInput.value.trim();
        
        // 如果输入为空，显示提示并返回
        if (taskText === '') {
            taskInput.classList.add('error');
            setTimeout(() => {
                taskInput.classList.remove('error');
            }, 500);
            return;
        }
        
        // 创建新任务对象
        const newTask = {
            id: Date.now(), // 使用时间戳作为唯一ID
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // 将新任务添加到任务数组
        tasks.unshift(newTask); // 添加到数组开头，使新任务显示在顶部
        
        // 保存到本地存储
        saveTasks();
        
        // 清空输入框
        taskInput.value = '';
        
        // 重新渲染任务列表
        renderTasks();
        
        // 更新任务计数
        updateTaskCount();
        
        // 将焦点重新放回输入框
        taskInput.focus();
    }
    
    /**
     * 切换任务完成状态
     * @param {number} id - 任务ID
     */
    function toggleTaskStatus(id) {
        // 查找任务并切换其完成状态
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        
        // 保存到本地存储
        saveTasks();
        
        // 重新渲染任务列表
        renderTasks();
        
        // 更新任务计数
        updateTaskCount();
    }
    
    /**
     * 删除任务
     * @param {number} id - 任务ID
     */
    function deleteTask(id) {
        // 从任务数组中移除指定ID的任务
        tasks = tasks.filter(task => task.id !== id);
        
        // 保存到本地存储
        saveTasks();
        
        // 重新渲染任务列表
        renderTasks();
        
        // 更新任务计数
        updateTaskCount();
    }
    
    /**
     * 清除所有已完成的任务
     */
    function clearCompletedTasks() {
        // 只保留未完成的任务
        tasks = tasks.filter(task => !task.completed);
        
        // 保存到本地存储
        saveTasks();
        
        // 重新渲染任务列表
        renderTasks();
        
        // 更新任务计数
        updateTaskCount();
    }
    
    /**
     * 渲染任务列表
     * 根据当前过滤器状态显示相应的任务
     */
    function renderTasks() {
        // 清空任务列表
        taskList.innerHTML = '';
        
        // 根据过滤器筛选任务
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        // 如果没有任务，显示提示信息
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = currentFilter === 'all' ? '没有待办事项' :
                                      currentFilter === 'active' ? '没有未完成的待办事项' :
                                      '没有已完成的待办事项';
            taskList.appendChild(emptyMessage);
            return;
        }
        
        // 遍历任务并创建列表项
        filteredTasks.forEach(task => {
            // 创建列表项
            const li = document.createElement('li');
            li.className = 'task-item';
            if (task.completed) {
                li.classList.add('completed');
            }
            
            // 创建复选框
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
            
            // 创建任务文本
            const span = document.createElement('span');
            span.className = 'task-text';
            span.textContent = task.text;
            
            // 创建删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
            
            // 将元素添加到列表项
            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);
            
            // 将列表项添加到任务列表
            taskList.appendChild(li);
        });
    }
    
    /**
     * 更新任务计数
     * 显示未完成任务的数量
     */
    function updateTaskCount() {
        // 计算未完成任务的数量
        const uncompletedCount = tasks.filter(task => !task.completed).length;
        
        // 更新显示
        taskCount.textContent = uncompletedCount;
    }
    
    /**
     * 保存任务到本地存储
     */
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});