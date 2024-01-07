// Функция addEditDeleteButtons принимает элемент задачи (task_elem) и добавляет к нему кнопки "Редактировать" и "Удалить".
function addEditDeleteButtons(task_elem) {
    // Создаем кнопку "Редактировать" (editBtn) с текстом "✎" и обработчиком события click.
    var editBtn = $('<span>')
        .addClass('edit-btn')
        .text('✎')
        .on('click', function() {
            // При клике на кнопку "Редактировать" выводим диалоговое окно для редактирования задачи.
            var updatedTask = prompt('Редактировать задание:', task_elem.find('span.task-text').text());
            if (updatedTask !== null) {
                task_elem.find('span.task-text').text(updatedTask);
            }
        });

    // Создаем кнопку "Удалить" (deleteBtn) с текстом "❌" и обработчиком события click.
    var deleteBtn = $('<span>')
        .addClass('edit-btn')
        .text('❌')
        .on('click', function() {
            if (task_elem.hasClass('important')) {
                // Если задача важная, показываем модальное окно подтверждения удаления.
                $('#deleteModal').show();

                // Обработка кнопок в модальном окне.
                $('#confirmDelete').on('click', function() {
                    task_elem.remove();
                    $('#deleteModal').hide();
                });

                $('#cancelDelete').on('click', function() {
                    $('#deleteModal').hide();
                });
            } else {
                // Если задача не важная, удаляем ее сразу.
                task_elem.remove();
            }
        });

    // Добавляем созданные кнопки к элементу задачи.
    task_elem.append(editBtn).append(deleteBtn);
}

// Функция fetchUserData выполняет AJAX-запрос для получения имени пользователя по его ID.
function fetchUserData(userId, callback) {
    var userUrl = 'https://jsonplaceholder.typicode.com/users/' + userId;

    $.ajax({
        url: userUrl,
        method: 'get',
        dataType: 'json',
        success: function(user) {
            // При успешном запросе вызываем переданный callback с именем пользователя.
            callback(user.name);
        },
        error: function() {
            // В случае ошибки выводим "Unknown User".
            callback('Unknown User');
        }
    });
}

// Функция showError выводит сообщение об ошибке на странице.
function showError(message) {
    $('#userIdError').text(message);
}

// Обработчик события submit формы с id "taskForm".
$('#taskForm').on('submit', function(e) {
    e.preventDefault();

    // Получаем данные из формы.
    var title = $('#title').val();
    var body = $('#body').val();
    var userId = $('#userId').val();
    var isImportant = $('#important').prop('checked');

    // Проверка корректности ID пользователя.
    if (userId < 1 || userId > 10 || isNaN(userId)) {
        showError('Введите корректный ID пользователя (1-10).');
        return;
    } else {
        showError('');
    }

    // Создаем элемент задачи (task_elem) и добавляем кнопки редактирования и удаления.
    var task_elem = $('<div>')
        .addClass('task')
        .append('<input type="checkbox">')
        .append('<span class="task-text">' + title + '</span>')
        .append('<div class="creator"></div>');

    if (isImportant) {
        task_elem.addClass('important');
    }

    addEditDeleteButtons(task_elem);

    if (isImportant) {
        // Если задача важная, добавляем ее в начало списка.
        $('#tasks').prepend(task_elem);
    } else {
        // Если задача не важная, добавляем ее в конец списка.
        $('#tasks').append(task_elem);
    }

    // Выполняем AJAX-запрос для создания новой задачи.
    $.ajax({
        url: 'https://jsonplaceholder.typicode.com/todos',
        method: 'post',
        dataType: 'json',
        data: {
            title: title,
            body: body,
            userId: userId,
            completed: false
        },
        success: function(response) {
            // Получаем имя создателя задачи и выводим его.
            fetchUserData(userId, function(creatorName) {
                task_elem.find('.creator').text('Created by: ' + creatorName);
            });

            console.log(response);
            console.log(JSON.stringify(response));
        },
    });
});

// Обработчик события click на чекбоксах внутри задач.
$('body').on('click', 'input[type="checkbox"]', function() {
    var task = $(this).parents('.task');

    if (task.hasClass('strikeout')) {
        task.removeClass('strikeout');
        if (task.hasClass('important')) {
            // Если задача важная, перемещаем обратно в начало списка.
            task.prependTo($('#tasks'));
        } else {
            // Если задача не важная, перемещаем обратно в конец списка.
            task.appendTo($('#tasks'));
        }
    } else {
        task.addClass('strikeout');
        task.appendTo($('#done'));
    }
});

// Обработчики событий mouseenter и mouseleave для отображения кнопок редактирования и удаления при наведении на задачу.
$('#tasks, #done').on('mouseenter', '.task', function() {
    $(this).find('.edit-btn').show();
});

$('#tasks, #done').on('mouseleave', '.task', function() {
    $(this).find('.edit-btn').hide();
});

// Функция toggleTheme переключает тему (светлая/темная) на странице и сохраняет ее в localStorage.
function toggleTheme() {
    $('body').toggleClass('light-mode dark-mode');
    var currentTheme = $('body').hasClass('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
}

// Проверяем сохраненную тему в localStorage при загрузке страницы и применяем ее.
var savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    $('body').addClass(savedTheme + '-mode');
}
