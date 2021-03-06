import "./follow-unfollow-button.styles.less";
import followUnfollowButtonTemplateHtml from "./follow-unfollow-button.template.html";

import { IGlobalScope } from "../../../core/lib/interfaces";
import RelsService from "../../../core/services/RelsService";

interface IFollowUnfollowButtonController extends ng.IScope {
  user: any;
  showFollow: boolean;
  showUnfollow: boolean;
  following: number[] | string[];
}

const defaultOptions = {
  showFollow: false,
  showUnfollow: false,
  following: [],
};

class FollowUnfollowButtonController {
  public static $inject = [
    "$rootScope",
    "$scope",
    "RelsService",
  ];

  constructor(
    private $rootScope: IGlobalScope,
    private $scope: IFollowUnfollowButtonController,
    private relsService: RelsService,
  ) {
    this.ngOnInit();
  }

  private isVisible: boolean;
  private user: any;
  private showFollow: boolean;
  private showUnfollow: boolean;
  private following: any[];

  private ngOnInit() {
    this.user = this.$scope.user;

    this.following = this.$scope.following
    ? this.$scope.following : defaultOptions.following;

    this.showUnfollow = this.$scope.showUnfollow
    ? this.$scope.showUnfollow && this.checkAlreadyFollowing(this.user.id)
    : !this.$scope.showFollow ? true : defaultOptions.showUnfollow;

    this.showFollow = this.$scope.showFollow
    ? this.$scope.showFollow && !this.checkAlreadyFollowing(this.user.id)
    : !this.$scope.showUnfollow ? true : defaultOptions.showFollow;
    this.isVisible = this.$rootScope.user &&
      this.$rootScope.user.id !== undefined &&
      this.user.id !== this.$rootScope.user.id;
  }

  private checkAlreadyFollowing = (userId) => {
    return this.following.indexOf(userId) !== -1;
  }

  private onClick(action: "follow" | "unfollow") {
    switch (action) {
      case "follow":
        this.follow();
        break;

      case "unfollow":
        this.unfollow();
        break;

      default:
        break;
    }
  }

  private follow = () => {
    this.user.alreadyFollowing = !this.user.alreadyFollowing;

    if (this.isVisible) {
      this.relsService.followProfile(this.user.id);
    }
  }

  private unfollow = () => {
    if (this.user) {
      this.user.alreadyFollowing = false;
    }

    this.relsService.unfollowProfile(this.user.id);
  }

}

export default function followUnfollowButton(): ng.IDirective {
  return {
    controller: FollowUnfollowButtonController,
    controllerAs: "followUnfollowButtonCtrl",
    restrict: "E",
    scope: {
      showFollow: "=",
      showUnfollow: "=",
      user: "=",
      following: "=",
    },
    template: followUnfollowButtonTemplateHtml,
  };
}
