// MaterializeCSS functions

document.addEventListener('DOMContentLoaded', function() {
    var sidenavEl = document.querySelectorAll('.sidenav');
    var sidenavInt = M.Sidenav.init(sidenavEl);
});

document.addEventListener('DOMContentLoaded', function() {
    var selectEl = document.querySelectorAll('select');
    var selectInt = M.FormSelect.init(selectEl);
  });