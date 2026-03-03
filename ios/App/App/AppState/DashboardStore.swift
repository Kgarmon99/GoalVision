import Foundation
import Combine

final class DashboardStore: ObservableObject {
    @Published var dashboard: PersonalDashboard? {
        didSet {
            if let d = dashboard {
                DashboardStorage.save(d)
            } else {
                DashboardStorage.clear()
            }
        }
    }

    var hasDashboard: Bool { dashboard != nil }

    init() {
        dashboard = DashboardStorage.load()
    }

    func setDashboard(_ d: PersonalDashboard?) {
        dashboard = d
    }

    func updateDashboard(_ update: (inout PersonalDashboard) -> Void) {
        guard var d = dashboard else { return }
        update(&d)
        dashboard = d
    }
}
