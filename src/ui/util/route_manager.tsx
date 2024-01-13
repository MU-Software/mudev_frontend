import { mdiLinkVariant } from '@mdi/js'
import { Route, Routes } from 'react-router-dom'

import { SidebarItemData } from '@local/ui/component/bar/sidebar'
import { TopbarRouteData } from '@local/ui/component/bar/topbar'

class RouteDefinition {
  constructor(
    public readonly id: string,
    public readonly topBarTitleText: string,
    public readonly sideBarTooltipText: string,
    public readonly path: string,
    public readonly component: JSX.Element,
    public readonly icon: string = mdiLinkVariant, // mdi icons are actually SVG string
    public readonly shouldShowInSidebar: boolean = true,
    public readonly shouldBePositionedOnBottom: boolean = false
  ) {}

  public get sidebarItemData(): SidebarItemData {
    return new SidebarItemData(
      this.id,
      this.topBarTitleText,
      this.sideBarTooltipText,
      this.path,
      this.icon,
      this.shouldBePositionedOnBottom
    )
  }

  public get topbarRouteData(): TopbarRouteData {
    return new TopbarRouteData(this.topBarTitleText, this.path)
  }

  public get route(): JSX.Element {
    return <Route path={this.path} element={this.component} key={`route-key-${this.id}`} />
  }
}

class RouteDefinitionList {
  constructor(private readonly list: RouteDefinition[]) {}

  public get sidebarItems(): SidebarItemData[] {
    return this.list
      .filter((routeDefinition) => routeDefinition.shouldShowInSidebar)
      .map((routeDefinition) => routeDefinition.sidebarItemData)
  }

  public get topbarRoutes(): TopbarRouteData[] {
    return this.list.map((routeDefinition) => routeDefinition.topbarRouteData)
  }

  public get routes(): React.ReactNode {
    return <Routes>{this.list.map((routeDefinition) => routeDefinition.route)}</Routes>
  }
}

export { RouteDefinition, RouteDefinitionList }
