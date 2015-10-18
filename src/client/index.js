System.register(['./mtna/archive/archive'], function(exports_1) {
    var archive_1;
    return {
        setters:[
            function (archive_1_1) {
                archive_1 = archive_1_1;
            }],
        execute: function() {
            angular.module('mtna', [
                'mtna.templates',
                archive_1.Archive.module.name
            ]);
        }
    }
});
