import { TestBed } from '@angular/core/testing';

import { ReplayService } from 'src/app/replay-service/replay.service';
import { ReplayStateService } from './replay-state.service';
import { DomManipulationService } from '../domManipulation/service/dom-manipulation.service';
import { DialogService } from '../dialog/service/dialog.service';
import { StoryCreatorService } from '../storyCreator-service/story-creator.service';
import { MockService } from 'ng-mocks';
import { preBuildTestStory } from '../spec/testHelpers.spec';

describe('ReplayService', () => {
  let service: ReplayService;

  let storyCreatorServiceSpy: jasmine.SpyObj<StoryCreatorService>;
  let domManipulationServiceSpy: jasmine.SpyObj<DomManipulationService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;
  let replayStateServiceSpy: jasmine.SpyObj<ReplayStateService>;

  beforeEach(() => {
    const storyCreatorServiceMock = jasmine.createSpyObj(
      'StoryCreatorService',
      ['traceActivitiesAndCreateStory', 'isStoryConsecutivelyNumbered']
    );
    const domManipulationServiceMock = jasmine.createSpyObj(
      'DomManipulationService',
      ['showStep', 'showAll']
    );
    const dialogServiceMock = jasmine.createSpyObj('dialogService', [
      'openDialog',
    ]);
    const replayStateServiceMock = jasmine.createSpyObj('replayState', [
      'setReplayState',
    ]);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ReplayStateService,
          useValue: replayStateServiceMock,
        },
        {
          provide: DomManipulationService,
          useValue: domManipulationServiceMock,
        },
        {
          provide: DialogService,
          useValue: dialogServiceMock,
        },
        {
          provide: StoryCreatorService,
          useValue: storyCreatorServiceMock,
        },
      ],
    });
    service = TestBed.inject(ReplayService);

    storyCreatorServiceSpy = TestBed.inject(
      StoryCreatorService
    ) as jasmine.SpyObj<StoryCreatorService>;
    domManipulationServiceSpy = TestBed.inject(
      DomManipulationService
    ) as jasmine.SpyObj<DomManipulationService>;
    dialogServiceSpy = TestBed.inject(
      DialogService
    ) as jasmine.SpyObj<DialogService>;
    replayStateServiceSpy = TestBed.inject(
      ReplayStateService
    ) as jasmine.SpyObj<ReplayStateService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return initial currentStepNumber', () => {
    service
      .getCurrentStepNumberObservable()
      .subscribe((value) => expect(value).toEqual(-1));
  });

  it('should return initial maxStepNumber', () => {
    service
      .getMaxStepNumberObservable()
      .subscribe((value) => expect(value).toEqual(0));
  });

  describe('initializeReplay', () => {
    beforeEach(() => {
      storyCreatorServiceSpy.traceActivitiesAndCreateStory.and.returnValue(
        preBuildTestStory(1)
      );
    });

    it('should initialize Replay', () => {
      service.initializeReplay();

      service
        .getCurrentStepNumberObservable()
        .subscribe((value) => expect(value).toEqual(1));
      service
        .getMaxStepNumberObservable()
        .subscribe((value) => expect(value).toEqual(1));
      expect(
        storyCreatorServiceSpy.traceActivitiesAndCreateStory
      ).toHaveBeenCalled();
    });
  });

  describe('should step through', () => {
    beforeEach(() => {
      storyCreatorServiceSpy.traceActivitiesAndCreateStory.and.returnValue(
        preBuildTestStory(2)
      );
      domManipulationServiceSpy.showStep.and.returnValue();
    });

    describe('nextStep ', () => {
      it('should not select next step when no story', () => {
        service.nextStep();

        service.getCurrentStepNumberObservable().subscribe((value) => {
          expect(value).toEqual(-1);
        });
        expect(domManipulationServiceSpy.showStep).toHaveBeenCalledTimes(0);
      });

      it('should select next step', () => {
        service.initializeReplay();
        service.nextStep();

        service.getCurrentStepNumberObservable().subscribe((value) => {
          expect(value).toEqual(2);
        });
        expect(domManipulationServiceSpy.showStep).toHaveBeenCalled();
      });

      it('should not select next step when last step', () => {
        service.initializeReplay();
        service.nextStep();

        service.getCurrentStepNumberObservable().subscribe((value) => {
          expect(value).toEqual(2);
        });
        service.nextStep();

        service.getCurrentStepNumberObservable().subscribe((value) => {
          expect(value).toEqual(2);
        });
        expect(domManipulationServiceSpy.showStep).toHaveBeenCalledTimes(1);
      });
    });

    describe('previousStep', () => {
      it('should not select previous step when no story', () => {
        service.previousStep();

        service.getCurrentStepNumberObservable().subscribe((value) => {
          expect(value).toEqual(-1);
        });
        expect(domManipulationServiceSpy.showStep).toHaveBeenCalledTimes(0);
      });

      it('should select previous step', () => {
        service.initializeReplay();
        service.nextStep();

        service.previousStep();

        service.getCurrentStepNumberObservable().subscribe((value) => {
          expect(value).toEqual(1);
        });
        expect(domManipulationServiceSpy.showStep).toHaveBeenCalled();
      });

      it('should not select previous step when first step', () => {
        service.initializeReplay();
        service.previousStep();

        service.getCurrentStepNumberObservable().subscribe((value) => {
          expect(value).toEqual(1);
        });
        expect(domManipulationServiceSpy.showStep).toHaveBeenCalledTimes(0);
      });
    });

    describe('startReplay', () => {
      beforeEach(() => {
        storyCreatorServiceSpy.traceActivitiesAndCreateStory.and.returnValue(
          preBuildTestStory(1)
        );
        domManipulationServiceSpy.showStep.and.returnValue();
        dialogServiceSpy.openDialog.and.returnValue();
        replayStateServiceSpy.setReplayState.and.returnValue();
      });

      it('should show dialog if not consecutively numbered', () => {
        storyCreatorServiceSpy.isStoryConsecutivelyNumbered.and.returnValue(
          false
        );

        service.startReplay();

        expect(
          storyCreatorServiceSpy.isStoryConsecutivelyNumbered
        ).toHaveBeenCalled();
        expect(dialogServiceSpy.openDialog).toHaveBeenCalled();
      });

      it(' should start replay if consecutively numbered', () => {
        storyCreatorServiceSpy.isStoryConsecutivelyNumbered.and.returnValue(
          true
        );

        service.startReplay();

        expect(
          storyCreatorServiceSpy.isStoryConsecutivelyNumbered
        ).toHaveBeenCalled();
        expect(replayStateServiceSpy.setReplayState).toHaveBeenCalledOnceWith(
          true
        );
        expect(domManipulationServiceSpy.showStep).toHaveBeenCalled();
      });
    });

    describe('stopReplay', () => {
      beforeEach(() => {
        dialogServiceSpy.openDialog.and.returnValue();
        replayStateServiceSpy.setReplayState.and.returnValue();
        storyCreatorServiceSpy.traceActivitiesAndCreateStory.and.returnValue(
          preBuildTestStory(1)
        );
        domManipulationServiceSpy.showStep.and.returnValue();
        replayStateServiceSpy.setReplayState.and.returnValue();
        storyCreatorServiceSpy.isStoryConsecutivelyNumbered.and.returnValue(
          true
        );

        service.startReplay();
      });

      it('should call methods', () => {
        service.stopReplay();

        service
          .getCurrentStepNumberObservable()
          .subscribe((value) => expect(value).toEqual(-1));
        service
          .getMaxStepNumberObservable()
          .subscribe((value) => expect(value).toEqual(0));

        expect(replayStateServiceSpy.setReplayState).toHaveBeenCalledWith(true);
        expect(replayStateServiceSpy.setReplayState).toHaveBeenCalledWith(
          false
        );
        expect(domManipulationServiceSpy.showAll).toHaveBeenCalled();
      });
    });
  });
});