var app = angular.module("todoApp", []);

app.controller("todoCtrl", function($scope, $http) {

  const API_BASE = "http://localhost:4000/api";

  $scope.tasks = [];
  $scope.newTask = "";

  // Load tasks from MongoDB
  $scope.loadTasks = function() {
    $http.get(API_BASE + "/tasks")
      .then(function(response) {
        $scope.tasks = response.data;
      })
      .catch(function(error) {
        console.error("Load error", error);
      });
  };

  // Add task
  $scope.addTask = function() {
    if (!$scope.newTask) return;

    $http.post(API_BASE + "/tasks", { text: $scope.newTask })
      .then(function(response) {
        $scope.tasks.unshift(response.data);
        $scope.newTask = "";
      })
      .catch(function(error) {
        console.error("Add error", error);
      });
  };

  // Toggle task
  $scope.toggleTask = function(task) {
    $http.put(API_BASE + "/tasks/" + task._id, { done: !task.done })
      .then(function(response) {
        task.done = response.data.done;
      })
      .catch(function(error) {
        console.error("Toggle error", error);
      });
  };

  // Delete task
  $scope.removeTask = function(index) {
    let task = $scope.tasks[index];

    $http.delete(API_BASE + "/tasks/" + task._id)
      .then(function() {
        $scope.tasks.splice(index, 1);
      })
      .catch(function(error) {
        console.error("Delete error", error);
      });
  };

  // Clear all tasks
  $scope.clearTasks = function() {
    $http.delete(API_BASE + "/tasks")
      .then(function() {
        $scope.tasks = [];
      })
      .catch(function(error) {
        console.error("Clear error", error);
      });
  };

  // Load tasks initially
  $scope.loadTasks();

});