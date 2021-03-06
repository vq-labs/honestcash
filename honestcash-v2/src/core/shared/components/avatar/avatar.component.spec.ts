import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {AVATAR_DEFAULT_THUMBNAIL, SharedAvatarComponent} from './avatar.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';

describe('SharedAvatarComponent', () => {
  let component: SharedAvatarComponent;
  let fixture: ComponentFixture<SharedAvatarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [SharedAvatarComponent],
      providers: [],
      schemas: [
        NO_ERRORS_SCHEMA,
      ]
    });
    fixture = TestBed.createComponent(SharedAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trim the src when provided', () => {
    const url = '   http://toto.com    ';
    component.src = url;
    expect(component.src).toEqual(url.trim());
  });

  it('should fall back to a thumbnail if src is not provided', () => {
    // when we use the avatar component
    // we always provide a src
    // that src can also be undefined
    // trigger set manually
    component.src = undefined;
    expect(component.src).toEqual(AVATAR_DEFAULT_THUMBNAIL);
  });

});
