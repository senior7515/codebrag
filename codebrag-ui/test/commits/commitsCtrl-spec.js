'use strict';

describe("Commits Controller", function () {

    var pendingCommits = ['commit1', 'commit2'];

    var $scope,
        $rootScope,
        $q,
        commitsService,
        notificationService,
        $stateParams,
        events;

    beforeEach(module('codebrag.commits', 'codebrag.notifications'));

    beforeEach(inject(function(_$rootScope_, _$q_, $controller, _commitsService_, _$stateParams_, _events_, _notificationService_) {
        $scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;
        $q = _$q_;
        commitsService = _commitsService_;
        notificationService = _notificationService_;
        $stateParams = _$stateParams_;
        events = _events_;
    }));

    beforeEach(inject(function($controller) {
        spyOn(commitsService, 'loadCommits').andReturn($q.defer().promise);
        $controller('CommitsCtrl', {$scope: $scope, commitsListService: commitsService, $stateParams: $stateParams});
    }));

    it('should have initial list mode set to pending', function() {
        expect($scope.listViewMode).toBe('pending');
        expect(commitsService.loadCommits).toHaveBeenCalled();
    });

    it('should re-initialize controller when event received', inject(function(currentCommit) {
        // given
        currentCommit.set('dummy commit');

        // when
        $rootScope.$broadcast(events.reloadCommitsList);

        // then
        expect($scope.listViewMode).toBe('pending');
        expect(currentCommit.get()).toBeNull();
        expect(commitsService.loadCommits).toHaveBeenCalled();
    }));

    it('should load pending commits when view switched to pending', function() {
        // given
        commitsService.loadCommits.reset(); // reset spy call counter

        // When
        $scope.switchListView('pending');
        $scope.$apply();

        // then
        expect(commitsService.loadCommits.callCount).toBe(1);
    });

    it('should expose loaded commits to scope', function() {
        // Given
        var commits = $q.defer();
        commits.resolve(pendingCommits);
        commitsService.loadCommits.andReturn(commits.promise);

        // When
        $scope.switchListView('pending');
        $scope.$apply();

        //Then
        expect($scope.commits).toBe(pendingCommits);
    });

    it('should load newest commits in all mode when no commit is selected', function() {
        // given
        $stateParams.sha = null;

        // when
        $scope.switchListView('all');

        // then
        expect(commitsService.loadCommits).toHaveBeenCalledWith();
    });

    it('should load commits in all context when commit is selected', function() {
        // given
        $stateParams.sha = '123';

        // when
        $scope.switchListView('all');

        // then
        expect(commitsService.loadCommits).toHaveBeenCalledWith($stateParams.sha);
    });

    it('should indicate when all commits were reviewed', function() {
        // Given
        $scope.commits = [];
        spyOn(commitsService, 'hasNextCommits').andReturn(false);

        // When
        var result = $scope.allCommitsReviewed();

        expect(result).toBeTruthy();
    });

    it('should indicate when there is more commits to review on server', function() {
        // Given
        spyOn(commitsService, 'hasNextCommits').andReturn(true);

        // When
        var result = $scope.hasNextCommits();

        expect(result).toBeTruthy();
    });

    it('should return correct label (with counter) for reviewed commits', function() {
        // given
        notificationService.counters = {commitsCount: 10};

        // when
        var toReviewLabel = $scope.displaySelectedMode();
        $scope.switchListView('all');
        var allLabel = $scope.displaySelectedMode();

        // then
        expect(toReviewLabel).toBe('to review (10)');
        expect(allLabel).toBe('all');
    });
});
