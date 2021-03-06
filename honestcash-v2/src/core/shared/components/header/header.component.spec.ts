import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {LayoutHeaderComponent} from './header.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {provideMockStore} from '@ngrx/store/testing';
import {initialAppStates} from '../../../../app/app.states.mock';
import {Store} from '@ngrx/store';
import {AppStates} from '../../../../app/app.states';
import {WindowToken} from '../../helpers/window.helper';
import {localStorageProvider, LocalStorageToken} from '../../helpers/local-storage.helper';

const MockWindow = {
  location: {
    href: '',
  }
};

describe('LayoutHeaderComponent', () => {
  let component: LayoutHeaderComponent;
  let fixture: ComponentFixture<LayoutHeaderComponent>;
  let store: Store<AppStates>;
  let componentWindow: Window;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [LayoutHeaderComponent],
      providers: [
        {provide: WindowToken, useValue: MockWindow},
        {provide: 'PLATFORM_ID', useValue: 'browser'},
        {provide: LocalStorageToken, useFactory: localStorageProvider},
        provideMockStore({initialState: initialAppStates})
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ]
    });
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(LayoutHeaderComponent);
    component = fixture.componentInstance;
    componentWindow = TestBed.get(WindowToken);

    spyOn(store, 'dispatch').and.callThrough();
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have menuHidden true on init', () => {
    expect(component.menuHidden).toBeTruthy();
  });
});
