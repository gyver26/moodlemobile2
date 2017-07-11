// (C) Copyright 2015 Martin Dougiamas
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

angular.module('mm.core.courses')

/**
 * Controller to handle available courses.
 *
 * @module mm.core.courses
 * @ngdoc controller
 * @name mmCoursesAvailableCtrl
 */
.controller('mmCoursesAvailableCtrl', function($scope, $mmCourses, $q, $mmUtil, $mmSite) {
    /**
     * Function to sort courses by their main categories 
     */
    function sortbycategories(courses){
        var coursebycategory = courses, 
            coursesbyparent = [], categoriesbyid = [],
            categories = $scope.categories;
            
        /* sort categories by their id */
        for(x=0; x < categories.length; x++){
            if(typeof(categories[x]) != 'undefined' ){
                categoriesbyid[categories[x].id] = categoriesbyid[categories[x].id] || [];
                categoriesbyid[categories[x].id] = categories[x];
            }
        }

        for(i=0; i < coursebycategory.length; i++){
            if(typeof(coursebycategory[i]) != 'undefined' ){
                var index;
                if( typeof(categoriesbyid[coursebycategory[i].categoryid]) != 'undefined' && categoriesbyid[coursebycategory[i].categoryid].parent != 0 ){
                    index = categoriesbyid[coursebycategory[i].categoryid].parent;
                }
                else{
                    index = coursebycategory[coursebycategory[i].categoryid].categoryid;
                }
                coursesbyparent[index] = coursesbyparent[index] || [];
                coursesbyparent[index].push(coursebycategory[i]); 
            }
        } 
        
        return coursesbyparent;
    }

    // Convenience function to search courses.
    function loadCourses() {
        var frontpageCourseId = $mmSite.getSiteHomeId();
        return $mmCourses.getCoursesByField().then(function(courses) {
            $scope.courses = sortbycategories(courses.filter(function(course) {
                return course.id != frontpageCourseId;
            }));
        }).catch(function(message) {
            $mmUtil.showErrorModalDefault(message, 'mm.courses.errorloadcourses', true);
            return $q.reject();
        });
    }
    
    // Load Categories
    function loadCategories() {
        return $mmCourses.getCategories(0,1).then(function(categories){
            $scope.categories = categories.filter(function(){
                return true;
            });
        });
    }
    
    loadCategories().finally(function(){
        $scope.categoriesLoaded = true;
    }) ;
    loadCourses().finally(function() {
        $scope.coursesLoaded = true;
    });
    

    

    
    $scope.refreshCourses = function() {
        var promises = [];

        promises.push($mmCourses.invalidateUserCourses());
        promises.push($mmCourses.invalidateCoursesByField());

        $q.all(promises).finally(function() {
            loadCourses().finally(function() {
                $scope.$broadcast('scroll.refreshComplete');
            });
        });
    };
});
