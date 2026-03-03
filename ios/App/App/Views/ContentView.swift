import SwiftUI

struct ContentView: View {
    @EnvironmentObject var store: DashboardStore

    var body: some View {
        if store.hasDashboard {
            MainTabView()
        } else {
            WelcomeView()
        }
    }
}
