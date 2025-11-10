// 전역 변수
let currentPage = 'todo';
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let diaries = JSON.parse(localStorage.getItem('diaries')) || [];
let devLogs = JSON.parse(localStorage.getItem('devLogs')) || [];
let snippets = JSON.parse(localStorage.getItem('snippets')) || [];
let timerInterval = null;
let timerTime = 25 * 60; // 25분을 초로 변환
let isTimerRunning = false;
let isWorkTime = true;

showPage('todo');

// 시간 업데이트 함수
let timenow = () => {
    let today = new Date();   

    let year = today.getFullYear() - 2000; // 년도
    let month = today.getMonth() + 1;  // 월
    let date = today.getDate();  // 날짜

    let hours = today.getHours(); // 시
    let minutes = today.getMinutes();  // 분
    if(minutes < 10){
      minutes = `0${minutes}`
    }    

    const yearElement = document.getElementById("year");
    const monthDayElement = document.getElementById("month_day");
    const timeElement = document.getElementById("time");
    
    if (yearElement) yearElement.textContent = `${year}년`;
    if (monthDayElement) monthDayElement.textContent = `${month}월 ${date}일`;
    if (timeElement) timeElement.textContent = `${hours} : ${minutes}`;
};


// 페이지 전환 함수
function showPage(pageId) {
    // 모든 페이지 숨기기
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // 선택된 페이지 보이기
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 사이드바 활성 상태 업데이트
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const activeItem = document.querySelector(`[data-page="${pageId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
    
    currentPage = pageId;
    
    // 페이지별 초기화 함수 호출
    switch(pageId) {
        case 'todo':
            initTodoPage();
            break;
        case 'git':
            initGitPage();
            break;
        case 'notion':
            initNotionPage();
            break;
        case 'diary':
            initDiaryPage();
            break;
        case 'calendar':
            initCalendarPage();
            break;
        case 'devlog':
            initDevLogPage();
            break;
        case 'dashboard':
            initDashboardPage();
            break;
        case 'snippets':
            initSnippetsPage();
            break;
        case 'timer':
            initTimerPage();
            break;
        case 'statistics':
            initStatisticsPage();
            break;
    }
}

// 사이드바 클릭 다른 페이지 전환
$(document).on("click", ".nav-link", function(e) {
    e.preventDefault(); // 링크 기본 동작 막기
    const selected_list = $(this).closest(".nav-item");

    // 1. 사이드바 active 갱신
    $(".nav-item.active").removeClass("active");
    selected_list.addClass("active");
    $(".icon.icon-active").removeClass("icon-active");
    selected_list.find(".icon").addClass("icon-active");

    // 2. 페이지 전환
    const target = selected_list.data("page");
    console.log(selected_list.data("page"));
    $(".page").removeClass("active");
    $(`#${target}-page`).addClass("active");
    console.log(`#${target}-page`)

    showPage(target)
});


// Todo List 기능
function initTodoPage() {
    renderTodos();
}

function addTodo() {
    const input = document.getElementById('todo_text');
    const text = input.value.trim();
    
    if (text) {
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        todos.push(todo);
        localStorage.setItem('todos', JSON.stringify(todos));
        input.value = '';
        renderTodos();
    }
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodos();
}

function renderTodos() {
    const todoList = document.getElementById('todo-list');
    if (!todoList) return;
    
    if (todos.length === 0) {
        todoList.innerHTML = '<p class="empty-state">할 일이 없습니다. 새로운 할 일을 추가해보세요!</p>';
        return;
    }
    
    todoList.innerHTML = todos.map((todo, index) => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}" 
             draggable="true" 
             data-id="${todo.id}" 
             data-index="${index}">
            <div class="drag-handle">⋮⋮</div>
            <div class="todo-content">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
                <span class="todo-text">${todo.text}</span>
            </div>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">×</button>
        </div>
    `).join('');
    
    // 드래그 앤 드롭 이벤트 리스너 추가
    addDragAndDropListeners();
}

// 드래그 앤 드롭 기능
function addDragAndDropListeners() {
    const todoItems = document.querySelectorAll('.todo-item');
    
    todoItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('dragleave', handleDragLeave);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
    });
}

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    
    // 드래그 중인 요소가 아닌 경우에만 드롭 가능 표시
    if (draggedElement && draggedElement !== this) {
        this.classList.add('drag-over');
    }
    
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    this.classList.remove('drag-over');
    
    if (draggedElement && draggedElement !== this) {
        const draggedId = parseInt(draggedElement.dataset.id);
        const targetId = parseInt(this.dataset.id);
        
        // 배열에서 순서 변경
        const draggedIndex = todos.findIndex(todo => todo.id === draggedId);
        const targetIndex = todos.findIndex(todo => todo.id === targetId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
            // 배열에서 요소 제거하고 새 위치에 삽입
            const draggedTodo = todos.splice(draggedIndex, 1)[0];
            todos.splice(targetIndex, 0, draggedTodo);
            
            // 로컬 스토리지 업데이트
            localStorage.setItem('todos', JSON.stringify(todos));
            
            // UI 다시 렌더링
            renderTodos();
        }
    }
    
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    // 모든 드롭 가능한 요소에서 drag-over 클래스 제거
    document.querySelectorAll('.todo-item').forEach(item => {
        item.classList.remove('drag-over');
    });
    draggedElement = null;
}

// Git 관리 기능
function initGitPage() {
    // Git 상태 업데이트 (실제로는 서버와 통신해야 함)
    updateGitStatus();
}

function updateGitStatus() {
    // 실제 구현에서는 Git API를 호출해야 함
    document.getElementById('current-branch').textContent = 'main';
    document.getElementById('changed-files').textContent = '0';
}

function runGitCommand(command) {
    // 실제 구현에서는 서버를 통해 Git 명령어를 실행해야 함
    Toastify({
        text: `Git 명령어 실행: ${command}`,
        duration: 3000
    }).showToast();
}

// Notion 기능
function initNotionPage() {
    // Notion 설정 로드
    const apiKey = localStorage.getItem('notion-api-key');
    const dbId = localStorage.getItem('notion-db-id');
    
    if (apiKey) document.getElementById('notion-api-key').value = apiKey;
    if (dbId) document.getElementById('notion-db-id').value = dbId;
}

// 일기장 기능
function initDiaryPage() {
    renderDiaries();
}

function saveDiary() {
    const content = document.getElementById('diary-content').value.trim();
    
    if (content) {
        const diary = {
            id: Date.now(),
            content: content,
            createdAt: new Date().toISOString()
        };
        
        diaries.unshift(diary);
        localStorage.setItem('diaries', JSON.stringify(diaries));
        document.getElementById('diary-content').value = '';
        renderDiaries();
    }
}

function clearDiary() {
    document.getElementById('diary-content').value = '';
}

function renderDiaries() {
    const diaryEntries = document.getElementById('diary-entries');
    if (!diaryEntries) return;
    
    if (diaries.length === 0) {
        diaryEntries.innerHTML = '<p class="empty-state">아직 작성된 일기가 없습니다.</p>';
        return;
    }
    
    diaryEntries.innerHTML = diaries.map(diary => `
        <div class="diary-entry">
            <div class="diary-date">${new Date(diary.createdAt).toLocaleDateString()}</div>
            <div class="diary-content">${diary.content}</div>
        </div>
    `).join('');
}

// 캘린더 기능
function initCalendarPage() {
    const today = new Date();
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
    renderCalendar();
    const todayString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    showEventsForDate(todayString);
}

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// ==============================
// 📅 일정 캘린더 기능 확장
// ==============================
let events = JSON.parse(localStorage.getItem("events")) || [];
let selectedDate = null;

// 캘린더 렌더링
function renderCalendar() {
  const calendarGrid = document.getElementById("calendar-grid");
  const currentMonthYear = document.getElementById("current-month-year");

  const now = new Date(currentYear, currentMonth);
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

  currentMonthYear.textContent = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
  calendarGrid.innerHTML = "";

  // 요일 헤더
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  days.forEach(day => {
    const dayHeader = document.createElement("div");
    dayHeader.classList.add("day-header");
    dayHeader.textContent = day;
    calendarGrid.appendChild(dayHeader);
  });

  // 빈 칸
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.classList.add("empty");
    calendarGrid.appendChild(empty);
  }

  // 날짜 채우기
  for (let d = 1; d <= lastDate; d++) {
    const dateCell = document.createElement("div");
    dateCell.classList.add("calendar-day");

    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    dateCell.dataset.date = dateString;
    dateCell.innerHTML = `<span class="day-number">${d}</span>`;

    // 오늘 표시
    const today = new Date();
    if (
      d === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    ) {
      dateCell.classList.add("today");
    }

    // 일정 표시
    const dayEvents = events.filter(e => e.date === dateString);
    if (dayEvents.length > 0) {
      const preview = document.createElement("div");
      preview.classList.add("event-preview");
      preview.textContent = dayEvents[0].title; // 첫 일정 제목만 표시
      dateCell.appendChild(preview);
    }

    // 클릭 시 일정 표시
    dateCell.addEventListener("click", () => showEventsForDate(dateString));

    calendarGrid.appendChild(dateCell);
  }
}

// 일정 패널 렌더링
function showEventsForDate(dateString) {
  selectedDate = dateString;

  document.querySelectorAll(".calendar-day").forEach(day => {
    day.classList.toggle("selected", day.dataset.date === dateString);
  });
  
  const panel = document.querySelector(".event-panel");
  panel.innerHTML = `
    <h3><span class="highlight-date">${dateString}</span> 일정</h3>
    <div class="event-list"></div>
    <div class="event-form">
      <input type="text" id="event-title" placeholder="제목">
      <textarea id="event-desc" placeholder="내용" ></textarea>
      <button id="add-event">추가</button>
    </div>
  `;

  renderEventList();

  // 새 일정 추가
  document.getElementById("add-event").addEventListener("click", () => {
    const title = document.getElementById("event-title").value.trim();
    const desc = document.getElementById("event-desc").value.trim();
    if (!title) return Toastify({ text: "제목을 입력해주세요", backgroundColor: "#ff5f6d" }).showToast();

    events.push({ date: selectedDate, title, desc });
    localStorage.setItem("events", JSON.stringify(events));
    renderCalendar();
    renderEventList();
    document.getElementById("event-title").value = "";
    document.getElementById("event-desc").value = "";
  });
}

// 일정 목록 렌더링
function renderEventList() {
  const listEl = document.querySelector(".event-list");
  const dayEvents = events.filter(e => e.date === selectedDate);

  listEl.innerHTML =
    dayEvents.length === 0
      ? `<p class="empty-state">일정이 없습니다.</p>`
      : dayEvents
          .map(
            (e, i) => `
        <div class="event-item">
          <div>
            <strong>${e.title}</strong>
            <p>${e.desc || ""}</p>
          </div>
          <div class="event-actions">
            <button onclick="editEvent(${i})">✏️</button>
            <button onclick="deleteEvent(${i})">🗑️</button>
          </div>
        </div>`
          )
          .join("");
}

// 일정 수정
function editEvent(index) {
  const dayEvents = events.filter(e => e.date === selectedDate);
  const event = dayEvents[index];

  Swal.fire({
    title: "일정 수정",
    html: `
      <input id="edit-title" class="swal2-input" value="${event.title}">
      <textarea id="edit-desc" class="swal2-textarea">${event.desc || ""}</textarea>
    `,
    showCancelButton: true,
    confirmButtonText: "저장",
    cancelButtonText: "취소",
    preConfirm: () => ({
      title: document.getElementById("edit-title").value,
      desc: document.getElementById("edit-desc").value
    })
  }).then(result => {
    if (result.isConfirmed) {
      const globalIndex = events.findIndex(
        e => e.date === selectedDate && e.title === event.title && e.desc === event.desc
      );
      if (globalIndex !== -1) {
        events[globalIndex].title = result.value.title;
        events[globalIndex].desc = result.value.desc;
        localStorage.setItem("events", JSON.stringify(events));
        renderCalendar();
        renderEventList();
      }
    }
  });
}

// 일정 삭제
function deleteEvent(index) {
  Swal.fire({
    title: "정말 삭제할까요?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "삭제",
    cancelButtonText: "취소"
  }).then(result => {
    if (result.isConfirmed) {
      const dayEvents = events.filter(e => e.date === selectedDate);
      const target = dayEvents[index];
      events = events.filter(e => !(e.date === selectedDate && e.title === target.title && e.desc === target.desc));
      localStorage.setItem("events", JSON.stringify(events));
      renderCalendar();
      renderEventList();
      Toastify({ text: "삭제되었습니다.", backgroundColor: "#00b09b" }).showToast();
    }
  });
}

// 월 이동
document.getElementById("prev-month").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
});
document.getElementById("next-month").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});


// Dev Log 기능
function initDevLogPage() {
    renderDevLogs();
}

function saveDevLog() {
    const title = document.getElementById('log-title').value.trim();
    const content = document.getElementById('log-content').value.trim();
    const type = document.getElementById('log-type').value;
    
    if (title && content) {
        const log = {
            id: Date.now(),
            title: title,
            content: content,
            type: type,
            createdAt: new Date().toISOString()
        };
        
        devLogs.unshift(log);
        localStorage.setItem('devLogs', JSON.stringify(devLogs));
        
        document.getElementById('log-title').value = '';
        document.getElementById('log-content').value = '';
        renderDevLogs();
    }
}

function renderDevLogs() {
    const logEntries = document.getElementById('log-entries');
    if (!logEntries) return;
    
    if (devLogs.length === 0) {
        logEntries.innerHTML = '<p class="empty-state">아직 작성된 로그가 없습니다.</p>';
        return;
    }
    
    logEntries.innerHTML = devLogs.map(log => `
        <div class="log-entry">
            <div class="log-header">
                <h4>${log.title}</h4>
                <span class="log-type ${log.type}">${getLogTypeText(log.type)}</span>
            </div>
            <div class="log-content">${log.content}</div>
            <div class="log-date">${new Date(log.createdAt).toLocaleString()}</div>
        </div>
    `).join('');
}

function getLogTypeText(type) {
    const types = {
        'feature': '기능 개발',
        'bugfix': '버그 수정',
        'refactor': '리팩토링',
        'test': '테스트'
    };
    return types[type] || type;
}

// 대시보드 기능
function initDashboardPage() {
    updateDashboardStats();
}

function updateDashboardStats() {
    const completedTasks = todos.filter(t => t.completed).length;
    const inProgressTasks = todos.filter(t => !t.completed).length;
    const diaryCount = diaries.length;
    
    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('in-progress-tasks').textContent = inProgressTasks;
    document.getElementById('diary-count').textContent = diaryCount;
    document.getElementById('weekly-commits').textContent = '0'; // 실제로는 Git API에서 가져와야 함
}

// 코드 스니펫 기능
function initSnippetsPage() {
    renderSnippets();
}

function saveSnippet() {
    const title = document.getElementById('snippet-title').value.trim();
    const language = document.getElementById('snippet-language').value;
    const code = document.getElementById('snippet-code').value.trim();
    
    if (title && code) {
        const snippet = {
            id: Date.now(),
            title: title,
            language: language,
            code: code,
            createdAt: new Date().toISOString()
        };
        
        snippets.unshift(snippet);
        localStorage.setItem('snippets', JSON.stringify(snippets));
        
        document.getElementById('snippet-title').value = '';
        document.getElementById('snippet-code').value = '';
        renderSnippets();
    }
}

function clearSnippet() {
    document.getElementById('snippet-title').value = '';
    document.getElementById('snippet-code').value = '';
}

function renderSnippets() {
    const snippetsList = document.getElementById('snippets-list');
    if (!snippetsList) return;
    
    if (snippets.length === 0) {
        snippetsList.innerHTML = '<p class="empty-state">아직 저장된 스니펫이 없습니다.</p>';
        return;
    }
    
    snippetsList.innerHTML = snippets.map(snippet => `
        <div class="snippet-item">
            <div class="snippet-header">
                <h4>${snippet.title}</h4>
                <span class="snippet-language">${snippet.language}</span>
            </div>
            <pre class="snippet-code"><code>${snippet.code}</code></pre>
            <div class="snippet-actions">
                <button class="copy-btn" onclick="copySnippet('${snippet.code}')">복사</button>
                <button class="delete-btn snippet-delete-btn" onclick="deleteSnippet(${snippet.id})">삭제</button>
            </div>
        </div>
    `).join('');
}

function copySnippet(code) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code)
            .then(() => {Toastify({
                            text: "[ ${code} ]가 클립보드에 복사되었습니다.",
                            duration: 3000
                        }).showToast();
                    })
            .catch(err => {
                console.error('클립보드 복사 실패:', err);
                Toastify({
                    text: "복사에 실패했습니다.",
                    duration: 3000
                }).showToast();
            });
    } else {
        // 폴백: 임시 텍스트 영역을 만들어 복사
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            Toastify({
                text: `[ ${code} ]가 클립보드에 복사되었습니다. (폴백 사용)`,
                duration: 3000
            }).showToast();
        } catch (err) {
            console.error('폴백 복사 실패:', err);
            Toastify({
                text: "복사 기능을 사용할 수 없습니다.",
                duration: 3000
            }).showToast();
        }
        document.body.removeChild(textarea);
    }
}



function deleteSnippet(id) {
    Swal.fire({
		title: `[ ${snippets.find(s => s.id === id).title} ]을 정말 삭제 하시겠습니까?`,
		text: "이 작업은 되돌릴 수 없습니다!",
		icon: "warning",
		showCancelButton: true,
		confirmButtonColor: "#3085d6",
		cancelButtonColor: "#d33",
		confirmButtonText: "Delete!"
	}).then((result) => {
        if (result.isConfirmed) {
            snippets = snippets.filter(s => s.id !== id);
            localStorage.setItem('snippets', JSON.stringify(snippets));
            renderSnippets();
            Toastify({
                text: "Snippet 이 삭제 되었습니다.",
                duration: 3000
            }).showToast();
        }
    });
}

// 시간 추적 기능
function initTimerPage() {
    updateTimerDisplay();
}

function startTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        timerInterval = setInterval(() => {
            timerTime--;
            updateTimerDisplay();
            
            if (timerTime <= 0) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                
                if (isWorkTime) {
                    Toastify({
                        text: "작업 시간이 끝났습니다! 휴식 시간을 시작하세요.",
                        duration: 3000
                    }).showToast();
                    timerTime = parseInt(document.getElementById('break-duration').value) * 60;
                    isWorkTime = false;
                } else {
                    Toastify({
                        text: "휴식 시간이 끝났습니다! 작업을 시작하세요.",
                        duration: 3000
                    }).showToast();
                    timerTime = parseInt(document.getElementById('work-duration').value) * 60;
                    isWorkTime = true;
                }
                
                updateTimerDisplay();
            }
        }, 1000);
    }
}

function pauseTimer() {
    if (isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timerTime = parseInt(document.getElementById('work-duration').value) * 60;
    isWorkTime = true;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerTime / 60);
    const seconds = timerTime % 60;
    const display = document.getElementById('timer-display');
    if (display) {
        display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// 통계 기능
function initStatisticsPage() {
    updateStatistics();
}

function updateStatistics() {
    // 실제 구현에서는 Chart.js 등을 사용하여 차트를 그려야 함
    document.getElementById('total-work-time').textContent = '0시간';
    document.getElementById('completed-pomodoros').textContent = '0개';
    document.getElementById('code-lines').textContent = '0줄';
}

// 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    // 시간 업데이트 시작
timenow();
setInterval(timenow, 1000);

    // 사이드바 네비게이션 이벤트
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.closest('.nav-item').dataset.page;
            showPage(pageId);
        });
    });
    
    // Todo List 이벤트
    document.getElementById('add-todo-btn')?.addEventListener('click', addTodo);
    document.getElementById('todo_text')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    // 일기장 이벤트
    document.getElementById('save-diary')?.addEventListener('click', saveDiary);
    document.getElementById('clear-diary')?.addEventListener('click', clearDiary);
    
    // Dev Log 이벤트
    document.getElementById('save-log')?.addEventListener('click', saveDevLog);
    
    // 캘린더 이벤트
    document.getElementById('prev-month')?.addEventListener('click', prevMonth);
    document.getElementById('next-month')?.addEventListener('click', nextMonth);
    
    // 코드 스니펫 이벤트
    document.getElementById('save-snippet')?.addEventListener('click', saveSnippet);
    document.getElementById('clear-snippet')?.addEventListener('click', clearSnippet);
    
    // 시간 추적 이벤트
    document.getElementById('start-timer')?.addEventListener('click', startTimer);
    document.getElementById('pause-timer')?.addEventListener('click', pauseTimer);
    document.getElementById('reset-timer')?.addEventListener('click', resetTimer);
    
    // 초기 페이지 로드
    showPage('todo');

    // 헤더 인증 링크 상태 제어
    const currentUser = localStorage.getItem('currentUser');
    const loginLink = document.getElementById('nav-login');
    const signupLink = document.getElementById('nav-signup');
    const logoutLink = document.getElementById('nav-logout');
    if (currentUser) {
        if (loginLink) loginLink.style.display = 'none';
        if (signupLink) signupLink.style.display = 'none';
        if (logoutLink) {
            logoutLink.style.display = 'inline-block';
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                window.location.reload();
            });
        }
    }

    // 헤더 링크 경로 보정 (루트/하위 폴더 모두 동작)
    const isInPages = location.pathname.includes('/pages/');
    document.querySelectorAll('a[data-path]').forEach(a => {
        const target = a.getAttribute('data-path');
        const href = isInPages ? `../${target}` : `./${target}`;
        a.setAttribute('href', href);
    });
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
});