import { ComponentFactoryResolver, Injector } from "@angular/core";
import { Injectable, TemplateRef } from "@angular/core";
import { TableStore } from "../classes/table-store";
import { InitializationComponent } from "../components/initialization-component/initialization-component";
import { FieldType, MetaData } from "../interfaces/report-def";

@Injectable({providedIn: 'root'})
export class TableTemplateService {
  instance!: InitializationComponent;
  templates;

  initTemplates() {
    this.templates = { };
    this.templates[FieldType.Array] = this.instance.arrayTemplate;
    this.templates[FieldType.Boolean] = this.instance.defaultWithIcon;
    this.templates[FieldType.Currency] = this.instance.defaultTemplate;
    this.templates[FieldType.Date] = this.instance.defaultTemplate;
    this.templates[FieldType.DateTime] = this.instance.defaultTemplate;
    this.templates[FieldType.Expression] = this.instance.defaultTemplate;
    this.templates[FieldType.ImageUrl] = this.instance.imageUrlTemplate;
    this.templates[FieldType.Link] = this.instance.linkTemplate;
    this.templates[FieldType.Number] = this.instance.defaultTemplate;
    this.templates[FieldType.PhoneNumber] = this.instance.defaultTemplate;
    this.templates[FieldType.String] = this.instance.defaultTemplate;
    this.templates[FieldType.Unknown] = this.instance.defaultTemplate;
    this.templates[FieldType.Enum] = this.instance.defaultTemplate;
  }
  getTemplate(metaData: MetaData) : TemplateRef<any> {

    let tmp =  this.templates[metaData.fieldType];
    if(metaData.useIcon) {
      if(tmp === this.instance.defaultTemplate) {
        tmp = this.instance.defaultWithIcon;
      }
    }
    return tmp;
  }

  constructor(resolver: ComponentFactoryResolver, i: Injector,  ) {
        const factory = resolver.resolveComponentFactory(InitializationComponent);
        const c = factory.create(i);
        this.instance = c.instance;
        this.initTemplates();
  }
}
