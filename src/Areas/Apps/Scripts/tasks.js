var wvy = wvy || {};
wvy.taskapp = (function ($) {

    var vm = null;

    var init = function (id, guid, tasks) {
        var eventHub = new Vue();
        var appId = id;
        var appGuid = guid;

        var TaskStore = {
            state: {
                items: []
            },

            load: function () {
                this.state.items = tasks;
                return true;
            }
        };

        /* Form component */
        var Form = {
            template: '#tasks-form',
            data: function () {
                return {
                    newTask: ''
                };
            },
            methods: {
                addTask: function (e) {
                    var value = this.newTask && this.newTask.trim();
                    if (!value) {
                        return;
                    }

                    var taskApp = this;

                    $.ajax({
                        url: wvy.url.resolve('/apps/' + appId + '/' + appGuid + '/tasks'),
                        data: JSON.stringify({ name: value }),
                        method: 'POST',
                        contentType: 'application/json'
                    }).then(function (task) {
                        task.assigned_to = null;
                        task.assigned_to_user = null;
                        task.due_date = null;
                        eventHub.$emit('item-added', task);

                        taskApp.newTask = '';
                    });


                }
            }
        };

        /* Task item component */
        var TaskItem = {
            template: '#task-item',
            props: ['model', 'hide'],
            data: function () {
                return {
                    tempText: '',
                    isEditing: false
                };
            },
            filters: {
                datetime: function (d) {
                    return d ? new Date(d).toLocaleString() : "";
                }
            },

            computed: {
                isDone: function () {
                    return this.model.completed;
                },

                isDue: function () {
                    return this.model.due_date && new Date(this.model.due_date) <= new Date();
                },

                hasComments: function () {

                    return this.model.comments;
                },

                shouldHide: function () {
                    // work-around since Vue Draggable does not support computed lists                    
                    return this.hide && this.model.completed;
                },
                priority: function () {

                    return this.model.priority;
                }
            },

            methods: {

                hasPermission: function (permission) {
                    return $.inArray(permission, this.model.permissions) !== -1;
                },

                toggleStarred: function () {
                    this.model.is_starred = !this.model.is_starred;
                },

                editTaskDetails: function (e) {
                    if (e) {
                        e.preventDefault();
                    }

                    eventHub.$emit('task-details', this.model);
                },

                saveTask: function () {
                    eventHub.$emit('item-save', this.model);
                },

                save: function () {
                    if (this.isEditing && this.tempText !== '') {
                        this.model.name = this.tempText;
                        this.isEditing = false;

                        this.saveTask();
                    }
                },

                toggleCompleted: function (e) {
                    e.preventDefault();
                    this.model.completed = !this.model.completed;

                    $.ajax({
                        url: wvy.url.resolve('/content/' + this.model.id + '/' + this.model.content_type + '/toggle'),
                        method: 'PUT',
                        contentType: 'application/json'
                    }).then(function (task) {

                    });
                },

                edit: function () {
                    this.isEditing = true;
                    this.$nextTick(function () {
                        $(this.$el).find('input').focus();
                    });
                    this.tempText = this.model.name;
                },

                cancelEdit: function () {
                    this.isEditing = false;
                },

                deleteItem: function () {
                    eventHub.$emit('item-deleted', this.model);
                },

                showComments: function () {
                    eventHub.$emit('task-comments', this.model);
                },


                savePriority: function (type) {
                    this.model.priority = type;
                    this.saveTask();
                }
            },

            created: function () {
                if (window.location.hash) {
                    var hash = window.location.hash.substring(1);
                    var taskId = hash.split("-")[1];
                    if (taskId === this.model.id) {
                        this.editTaskDetails();
                    }
                }
            }

        };

        /* Task list component */
        var TaskList = {
            template: '#tasks-list',
            props: ['collection'],
            data: function () {
                return {
                    hideCompleted: false
                };
            },

            components: {
                'task-item': TaskItem
            },

            methods: {

                updateSortOrder: function () {
                    $.ajax({
                        url: wvy.url.resolve('/apps/' + appId + '/' + appGuid + '/tasks/sort'),
                        data: this.collection.map(x => "ids=" + x.id).join("&"),
                        method: 'POST'
                    });
                },

                onDrop: function (e) {
                    this.updateSortOrder();
                },

                saveTask: function (model) {

                    $.ajax({
                        url: wvy.url.resolve('/content/' + model.id + '/' + model.content_type + '/tasks'),
                        data: JSON.stringify({ id: model.id, name: model.name, description: model.description, completed: model.completed, dueDate: model.due_date, assignedTo: model.assigned_to, priority: model.priority }),
                        method: 'PUT',
                        contentType: 'application/json'
                    }).then(function (updatedTask) {
                        // update user assigned objects<
                        model.assigned_to = updatedTask.assigned_to;
                        model.assigned_to_user = updatedTask.assigned_to_user;
                    });
                },

                removeTask: function (task) {
                    var taskList = this;

                    $.ajax({
                        url: wvy.url.resolve('/content/' + task.id + '/' + task.content_type + '/tasks'),
                        method: 'DELETE',
                        contentType: 'application/json'
                    }).then(function (response) {
                        taskList.collection.splice(taskList.collection.indexOf(task), 1);
                    });
                }

            },

            created: function () {
                var taskList = this;

                taskList.hideCompleted = JSON.parse(localStorage.getItem("tasklist_hide_completed")) || false;

                eventHub.$on('toggle-completed', function (model) {
                    taskList.hideCompleted = model;
                });

                eventHub.$on('item-save', function (model) {
                    taskList.saveTask(model);
                });

                eventHub.$on('item-deleted', function (model) {
                    taskList.removeTask(model);
                });

                eventHub.$on('item-added', function (model) {
                    taskList.collection.unshift(model);
                    taskList.updateSortOrder();
                });
            }
        };

        /* Task toggle component */
        var TaskToggle = {
            template: '#tasks-toggle',
            props: ['collection'],
            data: function () {
                return {
                    hideCompleted: false
                };
            },

            computed: {
                completedTasks: function () {
                    var total = 0;

                    if (this.collection.length > 0) {
                        for (var i = 0; i < this.collection.length; i++) {
                            if (this.collection[i].completed) {
                                total++;
                            }
                        }
                    }

                    return total;
                },

                visible: function () {
                    for (var i = 0; i < this.collection.length; i++) {
                        if (this.collection[i].completed) {
                            return true;
                        }
                    }
                    return false;
                }

            },

            methods: {
                toggleCompleted: function (e) {
                    e.preventDefault();
                    this.hideCompleted = !this.hideCompleted;
                    localStorage.setItem("tasklist_hide_completed", this.hideCompleted);
                    eventHub.$emit('toggle-completed', this.hideCompleted);
                },

            },

            created: function () {
                var taskToggle = this;
                taskToggle.hideCompleted = JSON.parse(localStorage.getItem("tasklist_hide_completed")) || false;
            }
        };

        /* Task details modal */
        var TaskItemModal = {
            template: '#tasks-modal',
            data: function () {
                return {
                    model: null,
                    tmpName: '',
                    tmpDescription: '',
                    tmpDueDate: null,
                    tmpAssignedTo: null,
                    options: [],
                    picker: null
                };
            },
            methods: {
                show: function () {
                    var modal = this;
                    $('#task-details-modal').modal('show');

                    setTimeout(function () {
                        modal.picker = wvy.userspicker.init("select[data-role='user-picker']");
                        modal.picker.on("change", function () {
                            modal.tmpAssignedTo = this.value;
                        });
                    }, 1);


                },

                hide: function () {
                    this.cleanup();
                    $('#task-details-modal').modal('hide');
                },

                cleanup: function () {
                    // clear select2
                    this.options = [];
                    $("select[data-role=user-picker]").children().remove();
                    this.picker.select2('destroy');
                    this.picker = null;
                },

                update: function () {

                    if (this.tmpName !== '') {
                        this.model.name = this.tmpName;
                        this.model.description = this.tmpDescription;
                        this.model.due_date = this.tmpDueDate;
                        this.model.assigned_to = this.tmpAssignedTo;

                        eventHub.$emit('item-save', this.model);

                        this.hide();
                    }
                }
            },

            created: function () {
                var modal = this;
                eventHub.$on('task-details', function (model) {

                    // set values
                    modal.model = model;
                    modal.tmpName = model.name;
                    modal.tmpDescription = model.description;
                    if (model.due_date) {
                        // set due date in format required by html5 date input
                        modal.tmpDueDate = vm.formatDate(model.due_date);
                    } else {
                        modal.tmpDueDate = null;
                    }

                    modal.tmpAssignedTo = model.assigned_to;
                    modal.options = [];

                    if (model.assigned_to_user != null) {
                        modal.options.push({ text: model.assigned_to_user.profile.name, value: model.assigned_to_user.id });
                    } else {
                        modal.tmpAssignedTo = null;
                        modal.options = [];
                    }

                    // show modal
                    modal.show();
                });
            },


        };

        /* Task comments modal */
        var TaskItemComments = {
            template: '#tasks-comments',
            data: function () {
                return {
                    model: null
                };
            },
            methods: {
                show: function () {
                    var taskComments = this;
                    console.log(this, "tasks this")
                    var $modal = $('#task-comments-modal');
                    var $spinner = $(".spinner", $modal);
                    var $body = $(".modal-body", $modal);
                    $(".spinner", $modal).addClass("spin").show();
                    $(".modal-body", $modal).empty();

                    $.ajax({
                        url: wvy.url.resolve('/content/' + taskComments.model.id + '/' + taskComments.model.guid + '/comments'),
                        type: "GET"
                    }).then(function (html) {
                        $body.html(html);
                        wvy.comments.initCommentEditor($("textarea.comments-form", $body));
                    }).always(function () {
                        // hide spinner
                        $spinner.removeClass("spin").hide();
                    });

                    $('#task-comments-modal').modal('show');
                },

                hide: function () {
                    $('#task-comments-modal').modal('hide');
                }

            },

            created: function () {
                var modal = this;

                eventHub.$on('task-comments', function (model) {
                    modal.model = model;

                    modal.show();
                });
            }
        };

        /* App */
        vm = new Vue({
            el: '#app',
            data: function () {
                return {
                    taskListState: TaskStore.state
                };
            },

            mounted: function () {
                TaskStore.load();
                var app = this;

                // subscribe to realtime events (NOTE: data returned from real time uses camelCase formatting)

                // task toggle completed
                wvy.connection.default.on("task_toggle_completed", function (e, data) {
                    var t = TaskStore.state.items.find(function (task) {
                        return task.id === data.id;
                    });

                    if (t) {
                        t.completed = data.completed;
                    }
                });

                // task is updated
                wvy.connection.default.on("task_updated", function (e, data) {
                    var t = TaskStore.state.items.find(function (task) {
                        return task.id === data.id;
                    });

                    if (t) {
                        t.name = data.name;
                        t.description = data.description;
                        t.due_date = data.dueDate;
                        t.priority = data.priority;
                        t.assigned_to = data.assignedTo;
                        t.assigned_to_user = data.assignedToUser;
                    }

                });

                wvy.connection.default.on("star.weavy", function (e, data) {
                    if (data.type === 'content') {
                        var t = TaskStore.state.items.find(function (task) {
                            return task.id === data.id;
                        });
                        if (t) {
                            t.is_starred = true;
                        }
                    }
                });

                wvy.connection.default.on("unstar.weavy", function (e, data) {
                    if (data.type === 'content') {
                        var t = TaskStore.state.items.find(function (task) {
                            return task.id === data.id;
                        });
                        if (t) {
                            t.is_starred = false;
                        }
                    }
                });

                wvy.connection.default.on("comment-inserted.weavy", function (e, data) {
                    if (data.parent.type === 'content') {
                        var t = TaskStore.state.items.find(function (task) {
                            return task.id === data.parent.id;
                        });
                        if (t) {
                            // TODO: figure out how to trigger ui update...
                            //t.comments = [data];
                        }
                    }
                });
            },

            methods: {

                // format date for html5 input
                formatDate: function (dateString) {
                    if (dateString) {
                        return dateString.split('T')[0];
                    } else {
                        return null;
                    }
                }

            },

            components: {
                'tasks-form': Form,
                'tasks-list': TaskList,
                'tasks-toggle': TaskToggle,
                'tasks-modal': TaskItemModal,
                'tasks-comments': TaskItemComments
            }
        });

    };

    var destroy = function () {
        //vm.$destroy();
    };

    return {
        init: init,
        destroy: destroy
    };

})(jQuery);
