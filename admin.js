// declare a new module called 'myApp', and make it require the `ng-admin` module as a dependency
var myApp = angular.module('everestminds', ['ng-admin']);
// declare a function to run when the module bootstraps (during the 'config' phase)
myApp.config(['NgAdminConfigurationProvider', function (nga) {
    // create an admin application
    var admin = nga.application('LOTW Admin Portal').baseApiUrl('http://localhost:1337/');

    var question = nga.entity('questions');
    var questionResponse = nga.entity('questionrespones').label("Survey Responses");

  question.listView().fields([
      nga.field('body'),
      nga.field('active','boolean'),nga.field('isMultiSelect','boolean'),
      nga.field('answers', 'embedded_list') // Define a 1-N relationship with the (embedded) comment entity
          .targetFields([ // which comment fields to display in the datagrid / form
              nga.field('body').label('Answer body'),
              nga.field('value').label('Value')
          ]),

    ]);
///

  question.creationView().fields([
     // ...
       nga.field('body').validation({ required: true}),
       nga.field('active','choice').defaultValue("true").choices([
           { value: "true", label: 'true' },
           { value: "false", label: 'false' }]),

       nga.field('isMultiSelect','choice').defaultValue("false").label("Multi-Select").choices([
           { value: "true", label: 'true' },
           { value: "false", label: 'false' }
       ]),



     nga.field('answers', 'embedded_list') // Define a 1-N relationship with the (embedded) comment entity
         .targetFields([ // which comment fields to display in the datagrid / form
             nga.field('body').validation({ required: true}),
             nga.field('value').validation({ required: true}).label('Value'),
             // .cssClasses(function(entry) {
                 // if (entry.values.isMultiSelect) return 'hidden';
             // }),
             nga.field('isNumerical','choice').validation({ required: true}).label("Numerical").choices([
                 { value: "true", label: 'true' },
                 { value: "false", label: 'false' }
             ])
         ])
       ]);
  question.showView().fields([
   // ...
   nga.field('body'),
   nga.field('active','boolean'),nga.field('isMultiSelect','boolean'),

   nga.field('answers', 'embedded_list') // Define a 1-N relationship with the (embedded) comment entity
       .targetFields([ // which comment fields to display in the datagrid / form
           nga.field('body').label('Answer body'),
           nga.field('value').label('Value')
       ]),
   // ...
    ]);

  question.editionView().fields([
   nga.field('body').validation({ required: true}),
   nga.field('active','choice').choices([
       { value: "true", label: 'true' },
       { value: "false", label: 'false' }]),

   nga.field('answers', 'embedded_list') // Define a 1-N relationship with the (embedded) comment entity
       .targetFields([ // which comment fields to display in the datagrid / form
           nga.field('body').validation({ required: true}),
           nga.field('value').validation({ required: true}).label('Value'),
           nga.field('isNumerical','choice').validation({ required: true}).label("Numerical").choices([
               { value: "true", label: 'true' },
               { value: "false", label: 'false' }
           ]),
       ])
     ]);


  question.listView().listActions(['show','edit','delete']);
  question.editionView().actions(['show','delete','list']);
  /// Question Responses
  questionResponse.listView().fields([
      nga.field('response.first_name').label("First Name"),
      nga.field('response.email').label("Email"),
      nga.field('response.age').label("Age"),
      nga.field('response.id').label("Response ID"),

      nga.field('question.body').label("Question"),
      nga.field('answer.body').label("Answer"),
      nga.field('custom_action')
          .label('Custom YAY')
          .template('<send-email post = "entry"></send-email>')

    ]);
    questionResponse.listView().listActions(['show','edit','delete']);

    // questionResponse.showView().fields([
    //  // ...
    //  // faltten object
    //  // nga.field('response','template'),
    //  // nga.field('response', 'embedded_list') // Define a 1-N relationship with the (embedded) comment entity
    //  //     .targetFields([ // which comment fields to display in the datagrid / form
    //  //       nga.field('first_name').label("First Name"),
    //  //       nga.field('email').label("Email"),
    //  //       nga.field('age').label("Age"),
    //  //       nga.field('id').label("Id"),
    //  //
    //  //     ]),
    //  nga.field('response.first_name').label("First Name"),
    //  nga.field('response.email').label("Email"),
    //  nga.field('response.age').label("Age"),
    //  nga.field('response.id').label("Id"),
    //  nga.field('question.body').label("Question"),
    //  nga.field('answer.body').label("Answer"),
    //  nga.field('custom_action')
    //      .label('Custom YAY')
    //      .template('<send-email post = "entry"></send-email>')
    //   ]);


  admin.addEntity(question);
  admin.addEntity(questionResponse);
    // more configuration here later
    // ...
    // attach the admin application to the DOM and execute it
  nga.configure(admin);

}]);
// testing
myApp.config(function ($stateProvider) {
    $stateProvider.state('send-post', {
        parent: 'ng-admin',
        url: '/sendPost/:id',
        params: { id: null },
        controller: sendPostController,
        controllerAs: 'controller',
        template: sendPostControllerTemplate
    });
});

function sendPostController($stateParams, notification) {
    this.postId = $stateParams.id;
    // notification is the service used to display notifications on the top of the screen
    this.notification = notification;
};
sendPostController.inject = ['$stateParams', 'notification'];
sendPostController.prototype.sendEmail = function() {
    this.notification.log('Email successfully sent to ' + this.email);
};

var sendPostControllerTemplate =
    '<div class="row"><div class="col-lg-12">' +
        '<ma-view-actions><ma-back-button></ma-back-button></ma-view-actions>' +
        '<div class="page-header">' +
            '<h1>Send post #{{ controller.postId }} by email</h1>' +
        '</div>' +
    '</div></div>' +
    '<div class="row">' +
        '<div class="col-lg-5"><input type="text" size="10" ng-model="controller.email" class="form-control" placeholder="name@example.com"/></div>' +
        '<div class="col-lg-5"><a class="btn btn-default" ng-click="controller.sendEmail()">Send</a></div>' +
    '</div>';
myApp.directive('sendEmail', ['$location', function ($location) {
    return {
        restrict: 'E',
        scope: { post: '&' },
        link: function (scope) {
            scope.send = function () {
                $location.path('/sendPost/' + scope.post().values.response.id);
                // console.log("scope.post().values" , scope.post().values);
                console.log("scope.post().values.response.id" , scope.post().values.response.id);
                // console.log("scope.post().values.response JsonProperty" , scope.post().values.JsonProperty("response.id"));
                //
                // console.log("scope.post().values.route" , scope.post().values.route);



            };
        },
        template: '<a class="btn btn-default" ng-click="send()">Send post by email</a>'
    };
}]);
// end testing
myApp.config(['RestangularProvider', function(RestangularProvider) {
    RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params, httpConfig) {
        if (operation == 'getList') {
            params.skip = (params._page - 1) * params._perPage;
            params.limit = params._perPage;
            params.sort = params._sortField + ' ' + params._sortDir;
            delete params._sortField;
            delete params._sortDir;
            delete params._page;
            delete params._perPage;
        }
        return { params: params };
    });
}]);
