import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {forkJoin, Observable, of} from 'rxjs';
import {
  EditorActionTypes,
  EditorCommentSaveAndPublish,
  EditorCommentSaveAndPublishFailure,
  EditorCommentSaveAndPublishSuccess,
  EditorDraftLoadFailure,
  EditorDraftLoadSuccess,
  EditorParentStoryLoad,
  EditorParentStoryLoadFailure,
  EditorParentStoryLoadSuccess,
  EditorStoryLoad,
  EditorStoryLoadFailure,
  EditorStoryLoadSuccess,
  EditorStoryLocalLoadFailure,
  EditorStoryLocalLoadSuccess,
  EditorStoryPropertyChange,
  EditorStoryPropertySave,
  EditorStoryPropertySaveFailure,
  EditorStoryPropertySaveSuccess,
  EditorStoryPublishFailure,
  EditorStoryPublishSuccess,
  EditorStorySaveAndPublish,
  EditorStorySaveFailure,
  EditorStorySaveSuccess,
} from './editor.actions';
import {catchError, concatMap, map, share, switchMap} from 'rxjs/operators';
import Post from '../../shared/models/post';
import {EditorService, STORY_PROPERTIES} from '../../modules/editor/services/editor.service';
import {EmptyResponse, FailedResponse} from '../../shared/models/authentication';

@Injectable()
export class EditorEffects {

  constructor(
    private actions: Actions,
    private editorService: EditorService,
  ) {
  }

  @Effect()
  EditorDraftLoad: Observable<any> = this.actions.pipe(
    ofType(EditorActionTypes.EDITOR_DRAFT_LOAD),
    switchMap(() => this.editorService.loadPostDraft()
      .pipe(
        map((story: Post) => new EditorDraftLoadSuccess(story)),
        catchError(error => of(new EditorDraftLoadFailure(error))),
      ),
    ),
  );

  @Effect()
  EditorStoryLoad: Observable<any> = this.actions.pipe(
    ofType(EditorActionTypes.EDITOR_STORY_LOAD),
    map((action: EditorStoryLoad) => action.storyId),
    switchMap((storyId: number) => this.editorService.loadPostDraft({postId: storyId})
      .pipe(
        map((story: Post) => new EditorStoryLoadSuccess(story)),
        catchError(error => of(new EditorStoryLoadFailure(error))),
      ),
    ),
  );

  @Effect()
  EditorParentStoryLoad: Observable<any> = this.actions.pipe(
    ofType(EditorActionTypes.EDITOR_PARENT_STORY_LOAD),
    map((action: EditorParentStoryLoad) => action.storyId),
    switchMap((parentPostId: number) => this.editorService.loadPostDraft({parentPostId})
      .pipe(
        map((story: Post) => new EditorParentStoryLoadSuccess(story)),
        catchError(error => of(new EditorParentStoryLoadFailure(error))),
      ),
    ),
  );

  @Effect()
  EditorStoryLocalLoad: Observable<any> = this.actions.pipe(
    ofType(EditorActionTypes.EDITOR_STORY_LOCAL_LOAD),
    switchMap((storyId: number) => of(this.editorService.getLocallySavedPost())
      .pipe(
        map((story: Post) => new EditorStoryLocalLoadSuccess(story)),
        catchError(error => of(new EditorStoryLocalLoadFailure(error))),
      ),
    ),
  );

  @Effect()
  EditorStorySaveAndPublish: Observable<any> = this.actions.pipe(
    ofType(EditorActionTypes.EDITOR_STORY_SAVE_AND_PUBLISH),
    map((action: EditorStorySaveAndPublish) => action.payload),
    concatMap((post: Post) =>
      forkJoin(
        this.editorService.savePostProperty(post, STORY_PROPERTIES.BodyAndTitle),
        this.editorService.savePostProperty(post, STORY_PROPERTIES.Hashtags),
        this.editorService.savePostProperty(post, STORY_PROPERTIES.PaidSection),
      )
      .pipe(
        map((savePostPropertyResponse: EmptyResponse[]) => new EditorStorySaveSuccess(post)),
        catchError((error) => of(new EditorStorySaveFailure(error))),
      )
    ),
    ofType(EditorActionTypes.EDITOR_STORY_SAVE_SUCCESS),
    map((action: EditorStorySaveSuccess) => action.payload),
    switchMap((post: Post) => this.editorService.publishPost(post)
    .pipe(
      map((publishPostResponse: Post) => new EditorStoryPublishSuccess(publishPostResponse)),
      catchError((error) => of(new EditorStoryPublishFailure(error))
      ),
    ))
  );

  @Effect()
  EditorCommentAndPublish: Observable<any> = this.actions.pipe(
    ofType(EditorActionTypes.EDITOR_COMMENT_SAVE_AND_PUBLISH),
    map((action: EditorCommentSaveAndPublish) => action.payload),
    concatMap((post: Post) =>
      forkJoin(
        this.editorService.savePostProperty(post, STORY_PROPERTIES.BodyAndTitle),
      )
      .pipe(
        map((savePostPropertyResponse: EmptyResponse[]) => new EditorCommentSaveAndPublishSuccess(post)),
        catchError((error) => of(new EditorCommentSaveAndPublishFailure(error))),
      )
    ),
    ofType(EditorActionTypes.EDITOR_COMMENT_SAVE_AND_PUBLISH_SUCCESS),
    map((action: EditorCommentSaveAndPublishSuccess) => action.payload),
    switchMap((post: Post) => this.editorService.publishPost(post)
    .pipe(
      map((publishPostResponse: Post) => new EditorStoryPublishSuccess(publishPostResponse)),
      catchError((error) => of(new EditorStoryPublishFailure(error))
      ),
    ))
  );

  @Effect({dispatch: false})
  EditorStoryPropertyChange: Observable<any> = this.actions.pipe(
    ofType(EditorActionTypes.EDITOR_STORY_PROPERTY_CHANGE),
    map((action: EditorStoryPropertyChange) => action.payload),
    map((payload) => this.editorService.savePostPropertyLocally(payload.property, payload.value))
  );

  @Effect()
  EditorStoryPropertySave: Observable<any> = this.actions.pipe(
    ofType(EditorActionTypes.EDITOR_STORY_PROPERTY_SAVE),
    map((action: EditorStoryPropertySave) => action.payload),
    switchMap((payload) => this.editorService.savePostProperty(payload.story, payload.property)
      .pipe(
        map((response: EmptyResponse) => new EditorStoryPropertySaveSuccess()),
        catchError((error: FailedResponse) => of(new EditorStoryPropertySaveFailure())),
        share()
      )
    )
  );
}
