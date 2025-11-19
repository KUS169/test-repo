// app.js
var app = angular.module("todoApp", []);

app.controller("todoCtrl", function($scope, $timeout) {
  // Load tasks from localStorage or start with empty array
  $scope.tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Utility: persist current tasks array to localStorage
  function saveTasks() {
    try {
      localStorage.setItem("tasks", JSON.stringify($scope.tasks));
    } catch (e) {
      console.error("Failed to save tasks to localStorage", e);
    }
  }

  // Add new task
  $scope.addTask = function() {
    if ($scope.newTask && $scope.newTask.trim() !== "") {
      $scope.tasks.push({ text: $scope.newTask.trim(), done: false });
      $scope.newTask = "";
      saveTasks();

      // Trigger custom jQuery effect (optional)
      $("#taskInput").trigger("taskAdded");
    }
  };

  // Toggle completion status
  $scope.toggleTask = function(task) {
    task.done = !task.done;
    saveTasks();

    // trigger event with task text and done state
    $(document).trigger("taskToggled", [task.text, task.done]);
  };

  // Remove single task by index
  $scope.removeTask = function(index) {
    if (index >= 0 && index < $scope.tasks.length) {
      var removed = $scope.tasks.splice(index, 1);
      saveTasks();
      $(document).trigger("taskRemoved", [removed[0] ? removed[0].text : ""]);
    }
  };

  // Clear all tasks
  $scope.clearTasks = function() {
    if ($scope.tasks.length === 0) return;
    if (confirm("Are you sure you want to clear all tasks?")) {
      $scope.tasks = [];
      saveTasks();
      $(document).trigger("tasksCleared");
    }
  };

  // Allow editing task (optional UX)
  $scope.editTask = function(task) {
    // you can implement inline edit UI if desired
    // for now we simply focus on persistency + basic actions
  };

  // Ensure UI shows tasks that were loaded on start
  // (Angular will bind automatically, but we can trigger a small digest if needed)
  $timeout(function(){}, 0);
});