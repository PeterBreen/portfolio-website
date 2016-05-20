(function(module) {
  function Project (opts) {
    for (keys in opts) {
      this[keys] = opts[keys];
    }
  }
  //Attach to the constructor, not global
  Project.all = [];

  Project.prototype.toHtml = function(templateId) {
    var template = Handlebars.compile((templateId).html());
    this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
    this.publishStatus = this.publishedOn ? + this.daysAgo + ' days ago' : '(draft)';
    return template(this);
  };

  // Sort our data by date published, descending order
  Project.loadAll = function(passedData) {
    passedData.sort(function(a,b) {
      return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
    });

    Project.all = passedData.map(function(ele) {
      return new Project(ele);
    });
  };

  //reusable function to render from JSON and set localStorage for next loadAll
  var renderFromJSON = function() {
    $.getJSON({
      type: 'GET',
      url: 'data/portfolioData.json',
      success: function (data, message, xhr) {
        var eTag = xhr.getResponseHeader('eTag');
        localStorage.eTag = eTag;
        Project.loadAll(data);
        localStorage.portfolioData = JSON.stringify(data);
        portfolioView.initIndexPage();
      }
    });
  };
  //localstorage or JSON data source control
  Project.fetchAll = function() {
    if (localStorage.portfolioData) {
      $.ajax({
        type: 'HEAD',
        url: 'data/portfolioData.json',
        success: function (data, message, xhr) {
          var currentTag = xhr.getResponseHeader('eTag');
          if (currentTag === localStorage.eTag) {
            parsedLocal = JSON.parse(localStorage.portfolioData);
            Project.loadAll(parsedLocal);
            portfolioView.initIndexPage();
          } else {
            renderFromJSON();
          }
        }
      });
    } else {
      renderFromJSON();
    }
  };

  // Project.numWordsAll = function() {
  //   return Project.all.map(function(project) {
  //     return project.body.match(/\b\w+/g).length;
  //   })
  //   .reduce(function(a, b) {
  //     return a + b;
  //   });
  // };
  module.Project = Project;
})(window);
