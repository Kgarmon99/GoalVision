import Foundation

struct DashboardMetric: Codable, Identifiable {
    var id: String
    var label: String
    var current: Int
    var target: Int
    var previous: Int
    var deadline: String
    var unit: String?
    /// Optional code for display (e.g. "PLT-01")
    var code: String?
}

struct RoadmapPhase: Codable, Identifiable {
    var id: String
    var quarter: String
    var theme: String
    var goal: String
    var items: [String]
    /// Metric ids this phase supports (e.g. ["m1-123"] → "Supports: Schools Live")
    var supportedMetricIds: [String]?
    /// Optional date range for phase (ISO date strings, e.g. "2026-01-01", "2026-03-31")
    var startDate: String?
    var endDate: String?
}

struct AttackItem: Codable {
    var text: String
    var date: String
}

struct AttackToday: Codable {
    var text: String
    var completed: Bool
    var date: String
}

struct PersonalDashboard: Codable, Identifiable {
    var id: String
    var name: String
    var createdAt: String
    /// Optional vision/directive (e.g. "DOMINATE K-12 FINANCIAL LITERACY")
    var directive: String?
    var metrics: [DashboardMetric]
    var roadmapPhases: [RoadmapPhase]
    var roadmapCompleted: [String: Bool]
    var roadmapItemText: [String: String]
    var roadmapDeleted: [String: Bool]
    var roadmapAdded: [String: [String]]
    /// Custom display order of item keys per phase (e.g. ["q1-0", "q1-add-0", "q1-1"]). Nil = default order.
    var roadmapOrder: [String: [String]]?
    /// Optional due date per roadmap item key (ISO date string)
    var roadmapItemDueDate: [String: String]?
    /// Optional status per item: "todo" | "in_progress" | "done"
    var roadmapItemStatus: [String: String]?
    /// Phase id -> collapsed (true = collapsed)
    var roadmapPhaseCollapsed: [String: Bool]?
    var attackToday: AttackToday?
    var attackTomorrow: AttackItem?
}

// MARK: - Defaults & factory

extension PersonalDashboard {
    static let defaultMetricsTemplate: [DashboardMetric] = [
        .init(id: "m1", label: "Schools Live", current: 5, target: 2500, previous: 4, deadline: "2026-12-01", unit: "", code: "PLT-01"),
        .init(id: "m2", label: "Districts", current: 4, target: 100, previous: 3, deadline: "2026-12-01", unit: "", code: "DST-01"),
        .init(id: "m3", label: "Active Students", current: 2_000_000, target: 3_000_000, previous: 1_333_333, deadline: "2026-12-01", unit: "M", code: "STU-01"),
        .init(id: "m4", label: "ARR Revenue", current: 20_000_000, target: 20_000_000, previous: 20_000_000, deadline: "2026-12-01", unit: "$M", code: "REV-01"),
    ]

    static let defaultRoadmapTemplate: [RoadmapPhase] = [
        .init(id: "q1", quarter: "Q1", theme: "Foundation → Proof", goal: "Make it undeniable that it works.", items: ["Platform stability", "Simple onboarding (< 5 mins)", "Core engagement live", "Initial visibility and reporting"], supportedMetricIds: nil, startDate: "2026-01-01", endDate: "2026-03-31"),
        .init(id: "q2", quarter: "Q2", theme: "Acceleration → Lock-In", goal: "Make users dependent on it.", items: ["Multi-site rollouts", "Daily usage established", "Deeper engagement", "Clear ROI reporting"], supportedMetricIds: nil, startDate: "2026-04-01", endDate: "2026-06-30"),
        .init(id: "q3", quarter: "Q3", theme: "Scale → Authority", goal: "Become the obvious choice.", items: ["Wide deployment", "Standardized implementation", "Growth data visible", "Case studies and proof"], supportedMetricIds: nil, startDate: "2026-07-01", endDate: "2026-09-30"),
        .init(id: "q4", quarter: "Q4", theme: "Default Status", goal: "Make opting out feel silly.", items: ["Renewals finalized", "Long-term planning", "Institutional trust", "Year-end impact reports"], supportedMetricIds: nil, startDate: "2026-10-01", endDate: "2026-12-31"),
    ]

    static func createEmpty(name: String) -> PersonalDashboard {
        let t = String(Int(Date().timeIntervalSince1970 * 1000))
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return PersonalDashboard(
            id: "dash-\(t)",
            name: name.isEmpty ? "My Dashboard" : name,
            createdAt: formatter.string(from: Date()),
            directive: nil,
            metrics: [],
            roadmapPhases: [.init(id: "q1-\(t)", quarter: "Q1", theme: "My Phase", goal: "Your goal", items: ["First item"], supportedMetricIds: nil, startDate: nil, endDate: nil)],
            roadmapCompleted: [:],
            roadmapItemText: [:],
            roadmapDeleted: [:],
            roadmapAdded: [:],
            roadmapOrder: [:],
            roadmapItemDueDate: nil,
            roadmapItemStatus: nil,
            roadmapPhaseCollapsed: nil,
            attackToday: nil,
            attackTomorrow: nil
        )
    }

    static func createFromTemplate(name: String) -> PersonalDashboard {
        let t = String(Int(Date().timeIntervalSince1970 * 1000))
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return PersonalDashboard(
            id: "dash-\(t)",
            name: name.isEmpty ? "My Dashboard" : name,
            createdAt: formatter.string(from: Date()),
            directive: nil,
            metrics: defaultMetricsTemplate.map { m in
                var c = m; c.id = m.id + "-\(t)"; return c
            },
            roadmapPhases: defaultRoadmapTemplate.map { p in
                var c = p; c.id = p.id + "-\(t)"; c.items = p.items; c.supportedMetricIds = nil; return c
            },
            roadmapCompleted: [:],
            roadmapItemText: [:],
            roadmapDeleted: [:],
            roadmapAdded: [:],
            roadmapOrder: [:],
            roadmapItemDueDate: nil,
            roadmapItemStatus: nil,
            roadmapPhaseCollapsed: nil,
            attackToday: nil,
            attackTomorrow: nil
        )
    }
}
