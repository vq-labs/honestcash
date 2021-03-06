import moment from 'moment';
import {dateFormat} from '../../core/config/index';
import SocialSharing from '../lib/SocialSharing';
import {IFetchPostsArgs, Post, Unlock, Upvote} from '../models/models';

const sanitizeHtml = require('sanitize-html');

export default class PostService {
    public static $inject = [
        '$http',
        '$sce',
        'API_URL',
    ];

    constructor(
        private $http: ng.IHttpService,
        private $sce,
        private API_URL,
    ) {
    }

    public publishPic(postId, params, callback) {
        this.$http.put(`${this.API_URL}/post/image/publish`, {
            postId,
            tags: params.hashtags,
        }).then((response) => {
            callback(response.data);
        });
    }

    public upvote(upvote) {
        return this.$http.post(`${this.API_URL}/post/${upvote.postId}/upvote`, {
            postId: upvote.postId,
            txId: upvote.txId,
        });
    }

    public unlock(unlock) {
        return this.$http.post(`${this.API_URL}/post/${unlock.postId}/unlock`, {
            postId: unlock.postId,
            txId: unlock.txId,
        });
    }

    public createRef(ref) {
        return this.$http.post(`${this.API_URL}/post/${ref.postId}/ref`, {
            extId: ref.extId,
            postId: ref.postId,
        });
    }

    public async createPost(post: Post): Promise<Post> {
        const res = await this.$http.post(`${this.API_URL}/post`, post);

        return this.processPost(res.data as Post);
    }

    public async archivePost(post: Post) {
        return this.$http.put(`${this.API_URL}/post/${post.id}/archive`, post);
    }

    public displayHTML(html: string): string {
        const clean = sanitizeHtml(html, {
            allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
                'nl', 'li', 'b', 'strong', 'img', 'em', 'strike', 'code', 'hr', 'br', 'pre', 'iframe'],
            allowedAttributes: {
                a: ['href', 'name', 'target'],
                // We don"t currently allow img itself by default, but this
                // would make sense if we did. You could add srcset here,
                // and if you do the URL is checked for safety
                img: ['src'],
                p: ['class'],

                iframe: ['src', 'allowfullscreen'],
            },
            // Lots of these won"t come up by default because we don"t allow them
            selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
            // URL schemes we permit
            allowedSchemes: ['http', 'https'],
            allowedSchemesByTag: {},
            allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
            allowProtocolRelative: true,
        });

        return this.$sce.trustAsHtml(clean);
    }

    public async getById(postId: number): Promise<Post> {
        const res = await this.$http.get(`${this.API_URL}/v2/post/${postId}`);

        return this.processPost(res.data as Post);
    }

    public async getByAlias(username, alias): Promise<Post> {
        const res = await this.$http.get(`${this.API_URL}/post/${username}/${alias}`);

        return this.processPost(res.data as Post);
    }

    public async getUpvotes(postId: number): Promise<Upvote[]> {
        const res = await this.$http.get(`${this.API_URL}/post/${postId}/upvotes`);

        return res.data as Upvote[];
    }

    public async getResponses(postId: number): Promise<Post[]> {
        const res = await this.$http.get(`${this.API_URL}/v2/post/${postId}/responses`);

        return (res.data as Post[]).map(post => this.processPost(post));
    }

    public async getUnlocks(postId: number): Promise<Unlock[]> {
        const res = await this.$http.get(`${this.API_URL}/post/${postId}/unlocks`);

        return res.data as Unlock[];
    }

    public getUserUnlocks(userId?: number, callback?): void {
        this.$http.get(`${this.API_URL}/posts/unlocks${userId ? `?userId=${userId}` : ''}`)
        .then((response) => {
            const unlocks = (response.data as Unlock[]).map(this.processUnlock);
            callback(unlocks);
        });
    }

    public getPosts(query: IFetchPostsArgs, callback: (posts: Post[]) => void): void {
        this.$http({
            method: 'GET',
            params: query,
            url: `${this.API_URL}/v2/posts`,
        }).then((response) => {
            const feeds = (response.data as Post[]).map(this.processPost);

            callback(feeds);
        });
    }

    public formatDate(date: string): string {
        return moment(date).utc().format(dateFormat);
    }

    private processPost(post: Post): Post {
        post.createdAtFormatted = moment(post.createdAt).utc().format(dateFormat);
        post.updatedAtFormatted = moment(post.updatedAt).utc().format(dateFormat);
        post.publishedAtFormatted = moment(post.publishedAt).utc().format(dateFormat);
        post.archivedAtFormatted = moment(post.deletedAt).utc().format(dateFormat);

        post.shareURLs = SocialSharing.getFeedShareURLs(post);

        if (post.userPosts) {
            post.userPosts = post.userPosts.map(userPost => this.processPost(userPost));
        }

        return post;
    }

    private processUnlock = (unlock: Unlock): Unlock => {
        unlock.createdAtFormatted = moment(unlock.createdAt).utc().format(dateFormat);
        if (unlock.userPost) {
            unlock.userPost = this.processPost(unlock.userPost);
            (unlock.userPost as any).unlockedAtFormatted = this.formatDate(unlock.createdAt);
        }

        return unlock;
    };
}
