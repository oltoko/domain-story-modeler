import {Component, OnInit} from '@angular/core';
import {CustomDomainCofiguration, DomainConfiguration,} from 'src/app/Domain/Common/domainConfiguration';
import {DomainConfigurationService} from 'src/app/Service/Domain-Configuration/domain-configuration.service';
import {IconDictionaryService} from 'src/app/Service/Domain-Configuration/icon-dictionary.service';
import {BehaviorSubject} from 'rxjs';
import {Dictionary} from 'src/app/Domain/Common/dictionary/dictionary';
import {sanitizeIconName} from 'src/app/Utils/sanitizer';
import {IconFilterEnum} from '../../Domain/Domain-Configuration/iconFilterEnum';
import {DomainCustomizationService} from '../../Service/Domain-Configuration/domain-customization.service';

@Component({
  selector: 'app-domain-configuration',
  templateUrl: './domain-configuration.component.html',
  styleUrls: ['./domain-configuration.component.scss'],
})
export class DomainConfigurationComponent implements OnInit {
  private domainConfigurationTypes: CustomDomainCofiguration;

  public filter = new BehaviorSubject<IconFilterEnum>(
    IconFilterEnum.ICON_FILTER_NONE
  );

  selectedActors = new BehaviorSubject<string[]>([]);
  selectedWorkobjects = new BehaviorSubject<string[]>([]);

  allIcons: Dictionary;
  allIconNames = new BehaviorSubject<string[]>([]);
  allFilteredIconNames = new BehaviorSubject<string[]>([]);

  constructor(
    private configurationService: DomainConfigurationService,
    private iconDictionaryService: IconDictionaryService,
    private domainCustomizationService: DomainCustomizationService,
  ) {
    this.domainConfigurationTypes =
      this.domainCustomizationService.getDomainConfiguration().value;

    this.allIcons = this.iconDictionaryService.getFullDictionary();
    this.allIconNames.next(this.allIcons.keysArray().sort(this.sortByName()));

    // @ts-ignore
    this.selectedWorkobjects =
      this.domainCustomizationService.getSelectedWorkobjects();
    // @ts-ignore
    this.selectedActors = this.domainCustomizationService.getSelectedActors();
  }

  ngOnInit(): void {
    this.filter.subscribe((type) => {
      let allFiltered = this.getFilteredNamesForType(type);
      this.allFilteredIconNames.next(allFiltered.sort(this.sortByName()));
    });
  }

  private getFilteredNamesForType(type: IconFilterEnum): string[] {
    let allFiltered: string[] = [];
    switch (type) {
      case IconFilterEnum.ICON_FILTER_NONE:
        allFiltered = this.allIconNames.value;
        break;
      case IconFilterEnum.ICON_FILTER_ACTOR:
        allFiltered = this.allIconNames.value.filter((name) =>
          this.domainCustomizationService.checkForActor(name)
        );
        break;
      case IconFilterEnum.ICON_FILTER_WORKOBJECT:
        allFiltered = this.allIconNames.value.filter((name) =>
          this.domainCustomizationService.checkForWorkObject(name)
        );
        break;
      case IconFilterEnum.ICON_FILTER_UNASSIGNED:
        allFiltered = this.allIconNames.value.filter(
          (name) =>
            !this.domainCustomizationService.checkForActor(name) &&
            !this.domainCustomizationService.checkForWorkObject(name)
        );
        break;
    }
    return allFiltered;
  }

  resetDomain(): void {
    this.domainCustomizationService.resetDomain();
  }

  saveDomain(): void {
    this.domainCustomizationService.saveDomain();
  }

  exportDomain(): void {
    this.domainCustomizationService.exportDomain();
  }

  cancel(): void {
    this.domainCustomizationService.cancel();
  }

  startIconUpload(): void {
    // @ts-ignore
    document.getElementById('importIcon').click();
  }

  startDomainImport(): void {
    // @ts-ignore
    document.getElementById('importDomain').click();
  }

  importDomain(): void {
    // @ts-ignore
    const domainInputFile = document.getElementById('importDomain').files[0];
    const reader = new FileReader();

    reader.onloadend = (e) => {
      const config = JSON.parse(
        // @ts-ignore
        e.target.result.toString()
      ) as DomainConfiguration;
      this.configurationService.loadConfiguration(config, false);

      this.domainCustomizationService.importConfiguration(config);
    };

    reader.readAsText(domainInputFile);
  }

  importIcon(): void {
    // @ts-ignore
    const iconInputFile = document.getElementById('importIcon').files[0];
    const reader = new FileReader();
    const endIndex = iconInputFile.name.lastIndexOf('.');
    const name = sanitizeIconName(iconInputFile.name.substring(0, endIndex));
    const iconName = name + '_custom';

    reader.onloadend = (e) => {
      // @ts-ignore
      const src: string = e.target.result;
      this.iconDictionaryService.addIMGToIconDictionary(src, iconName);
      this.iconDictionaryService.registerIcon(iconName, src);

      this.allIcons = this.iconDictionaryService.getFullDictionary();
      this.allIconNames.next(this.allIcons.keysArray());
      this.filter.next(this.filter.value);

      this.domainCustomizationService.addNewIcon(iconName);
    };
    reader.readAsDataURL(iconInputFile);
  }

  filterForActors(): void {
    if (this.filter.value !== IconFilterEnum.ICON_FILTER_ACTOR) {
      this.filter.next(IconFilterEnum.ICON_FILTER_ACTOR);
    } else {
      this.filter.next(IconFilterEnum.ICON_FILTER_NONE);
    }
  }

  filterForWorkobjects(): void {
    if (this.filter.value !== IconFilterEnum.ICON_FILTER_WORKOBJECT) {
      this.filter.next(IconFilterEnum.ICON_FILTER_WORKOBJECT);
    } else {
      this.filter.next(IconFilterEnum.ICON_FILTER_NONE);
    }
  }

  filterForUnassigned(): void {
    if (this.filter.value !== IconFilterEnum.ICON_FILTER_UNASSIGNED) {
      this.filter.next(IconFilterEnum.ICON_FILTER_UNASSIGNED);
    } else {
      this.filter.next(IconFilterEnum.ICON_FILTER_NONE);
    }
  }

  filterByNameAndType($event: any) {
    const filteredByNameAndType = this.getFilteredNamesForType(
      this.filter.value
    ).filter((name) =>
      name.toLowerCase().includes($event.target.value.toLowerCase())
    );
    this.allFilteredIconNames.next(
      filteredByNameAndType.sort(this.sortByName())
    );
  }

  private sortByName() {
    return (a: string, b: string) => {
      if (a.includes('_custom') == b.includes('_custom')) {
        if (a < b) return -1;
        else {
          return 1;
        }
      } else {
        if (a.includes('_custom')) {
          return -1;
        } else {
          return 1;
        }
      }
    };
  }
}
