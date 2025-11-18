// app.js
var app = angular.module("todoApp", []);

app.controller("todoCtrl", function($scope) {
  $scope.tasks = [];

  // Add new task
  $scope.addTask = function() {
    if ($scope.newTask && $scope.newTask.trim() !== "") {
      $scope.tasks.push({ text: $scope.newTask.trim(), done: false });
      $scope.newTask = "";

      // Trigger custom jQuery effect
      $("#taskInput").trigger("taskAdded");
    }
  };

  // Toggle completion status
  $scope.toggleTask = function(task) {
    task.done = !task.done;
    $(document).trigger("taskToggled", [task.text, task.done]);
  };

  // Remove individual task
  $scope.removeTask = function(index) {
    $scope.tasks.splice(index, 1);
  };

  // Clear all tasks
  $scope.clearTasks = function() {
    if (confirm("Are you sure you want to clear all tasks?")) {
      $scope.tasks = [];
    }
  };
});
