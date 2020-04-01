import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FramePage } from './frame.page';

describe('FramePage', () => {
  let component: FramePage;
  let fixture: ComponentFixture<FramePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FramePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FramePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
