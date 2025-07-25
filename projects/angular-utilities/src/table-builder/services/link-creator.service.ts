import { get } from "lodash";
import { MetaData } from "../interfaces/report-def";

export function createLinkCreator<T>(metaData: MetaData<T>){
  const target = metaData.additional?.link?.target || metaData.additional?.target || '_blank';
  const useRouterLink = metaData.additional?.link?.useRouterLink || metaData.additional?.useRouterLink;
  const hasRoute = !!metaData.additional?.link?.interpolatedRoute;
  const routerLinkOptions = useRouterLink ? {
    queryParams: (element) => metaData.additional!.link!.routerLinkOptions?.queryParams?.reduce((map, [key, value]) => {
      map[key] = parseInterpolated(value, element);
      return map;
    }, {}) ?? null,
    fragment: metaData.additional!.link?.routerLinkOptions?.fragment,
    preserveFragment: metaData.additional!.link!.routerLinkOptions?.preserveFragment ?? false,
    queryParamsHandling: metaData.additional!.link!.routerLinkOptions?.queryParamsHandling ?? '',
  }
  : undefined;



  if (hasRoute) {
    return ({
      link: (element: T) => parseInterpolated(metaData.additional!.link!.interpolatedRoute!, element),
      target,
      useRouterLink,
      routerLinkOptions,
    });
  } else {
    const slashIfNeeded = !metaData.additional?.link?.base?.endsWith('/') ? '/' : '';
    const base = metaData.additional!.link?.base || metaData.additional!.base;
    const getKey = key(metaData);
    return ({
      link: (element: T) => `${base}${slashIfNeeded}${getKey(element)}`,
      target,
      useRouterLink,
      routerLinkOptions,
    });
  }
}

const key = (metaData : MetaData) => metaData.additional!.link?.urlKey ? 
  (element:any) => get(element, (metaData.additional!.link!.urlKey as string)) :
    metaData.additional!.urlKey ?
  (element:any) => get(element, (metaData.additional!.urlKey as string)) :
  (element:any) => get(element, metaData.key);

const parseInterpolated = ( interpolatedString: string, element: any ) =>
  interpolatedString.replace(/{([^}]+)}/g, (_, key) => get(element ,key));