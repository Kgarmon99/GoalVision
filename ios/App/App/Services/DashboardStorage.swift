import Foundation

enum DashboardStorage {
    private static let key = "goalvision-personal-dashboard"

    static func load() -> PersonalDashboard? {
        guard let data = UserDefaults.standard.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(PersonalDashboard.self, from: data)
    }

    static func save(_ dashboard: PersonalDashboard) {
        if let data = try? JSONEncoder().encode(dashboard) {
            UserDefaults.standard.set(data, forKey: key)
        }
    }

    static func clear() {
        UserDefaults.standard.removeObject(forKey: key)
    }
}
