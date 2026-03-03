import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardOverviewView()
                .tabItem {
                    Image(systemName: "chart.bar")
                    Text("Dashboard")
                }
                .tag(0)
            RoadmapView()
                .tabItem {
                    Image(systemName: "map")
                    Text("Roadmap")
                }
                .tag(1)
            NewDashboardTabView()
                .tabItem {
                    Image(systemName: "plus.circle")
                    Text("New")
                }
                .tag(2)
        }
        .accentColor(AppTheme.accent)
        .onAppear {
            let appearance = UITabBarAppearance()
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = UIColor(red: 0, green: 0, blue: 0, alpha: 1)
            appearance.shadowColor = .black
            appearance.shadowImage = nil
            UITabBar.appearance().standardAppearance = appearance
            UITabBar.appearance().scrollEdgeAppearance = appearance
            UITabBar.appearance().unselectedItemTintColor = UIColor(white: 0.45, alpha: 1)
            UITabBar.appearance().tintColor = UIColor(red: 0.2, green: 0.78, blue: 0.35, alpha: 1)
        }
    }
}

struct NewDashboardTabView: View {
    @EnvironmentObject var store: DashboardStore

    var body: some View {
        MatrixScreen {
            VStack(spacing: 0) {
                Spacer().frame(height: 88)
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 56, weight: .light))
                    .foregroundColor(AppTheme.accent)

                Text("New dashboard?")
                    .font(AppTheme.title2())
                    .foregroundColor(AppTheme.textPrimary)
                    .padding(.top, 28)
                Text("This replaces your current one.")
                    .font(AppTheme.body())
                    .foregroundColor(AppTheme.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 48)
                    .padding(.top, 8)

                MatrixPrimaryButton("Create new", icon: "arrow.clockwise") {
                    store.setDashboard(nil)
                }
                .padding(.horizontal, AppTheme.paddingScreen)
                .padding(.top, 36)

                Spacer()
            }
        }
    }
}
