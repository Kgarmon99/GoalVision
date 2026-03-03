import SwiftUI

struct RoadmapEditItem: Identifiable {
    var id: String { key }
    let key: String
    let initialText: String
    let initialDueDate: String
    let initialStatus: String
}

struct RoadmapView: View {
    @EnvironmentObject var store: DashboardStore
    @State private var newItemText: [String: String] = [:]
    @State private var editingItem: RoadmapEditItem?
    @State private var reorderPhaseId: String? = nil
    @State private var linkingPhase: RoadmapPhase? = nil
    @State private var editingPhase: RoadmapPhase? = nil
    @State private var showAddPhase = false
    @State private var phaseToDelete: RoadmapPhase? = nil

    var body: some View {
        guard let dashboard = store.dashboard else { return AnyView(EmptyView()) }
        return AnyView(
            MatrixScreen {
                VStack(spacing: 0) {
                    roadmapHeader()
                    ScrollView(.vertical, showsIndicators: false) {
                        VStack(alignment: .leading, spacing: AppTheme.spacingSection) {
                            roadmapOverviewCard(dashboard)
                            HStack {
                                SectionLabel(text: "Phases")
                                Spacer()
                                Button {
                                    showAddPhase = true
                                } label: {
                                    HStack(spacing: 4) {
                                        Image(systemName: "plus.circle.fill")
                                            .font(.system(size: 14))
                                        Text("Add phase")
                                            .font(AppTheme.caption1(.medium))
                                    }
                                    .foregroundColor(AppTheme.accent)
                                    .glowAccent(radius: 8, opacity: 0.25)
                                }
                                .buttonStyle(PremiumButtonStyle())
                            }
                            ForEach(Array(dashboard.roadmapPhases.enumerated()), id: \.element.id) { qIdx, phase in
                                phaseCard(phase, qIdx: qIdx, dashboard: dashboard)
                            }
                            quarterTimeline(dashboard)
                        }
                        .padding(AppTheme.paddingScreen)
                        .padding(.bottom, AppTheme.gridUnit * 2)
                    }
                }
                .sheet(item: $editingItem) { item in
                    EditRoadmapItemSheet(
                        key: item.key,
                        initialText: item.initialText,
                        initialDueDate: item.initialDueDate,
                        initialStatus: item.initialStatus,
                        onSave: { newText, dueDate, status in
                            store.updateDashboard { d in
                                d.roadmapItemText[item.key] = newText
                                if d.roadmapItemDueDate == nil { d.roadmapItemDueDate = [:] }
                                if dueDate.isEmpty { d.roadmapItemDueDate?[item.key] = nil } else { d.roadmapItemDueDate?[item.key] = dueDate }
                                if d.roadmapItemStatus == nil { d.roadmapItemStatus = [:] }
                                if status.isEmpty || status == "todo" { d.roadmapItemStatus?[item.key] = nil } else { d.roadmapItemStatus?[item.key] = status }
                                if status == "done" { d.roadmapCompleted[item.key] = true }
                            }
                            editingItem = nil
                        },
                        onCancel: { editingItem = nil }
                    )
                }
                .sheet(item: $linkingPhase) { phase in
                    LinkMetricsSheet(
                        phase: phase,
                        dashboard: dashboard,
                        onSave: { selectedIds in
                            store.updateDashboard { d in
                                if let idx = d.roadmapPhases.firstIndex(where: { $0.id == phase.id }) {
                                    d.roadmapPhases[idx].supportedMetricIds = selectedIds.isEmpty ? nil : selectedIds
                                }
                            }
                            linkingPhase = nil
                        },
                        onCancel: { linkingPhase = nil }
                    )
                }
                .sheet(item: $editingPhase) { phase in
                    EditPhaseSheet(
                        phase: phase,
                        onSave: { updated in
                            store.updateDashboard { d in
                                if let idx = d.roadmapPhases.firstIndex(where: { $0.id == phase.id }) {
                                    d.roadmapPhases[idx] = updated
                                }
                            }
                            editingPhase = nil
                        },
                        onCancel: { editingPhase = nil }
                    )
                }
                .sheet(isPresented: $showAddPhase) {
                    AddPhaseSheet(
                        existingPhases: dashboard.roadmapPhases,
                        onAdd: { newPhase in
                            store.updateDashboard { d in
                                d.roadmapPhases.append(newPhase)
                            }
                            showAddPhase = false
                        },
                        onCancel: { showAddPhase = false }
                    )
                }
                .alert("Delete phase?", isPresented: Binding(
                    get: { phaseToDelete != nil },
                    set: { if !$0 { phaseToDelete = nil } }
                )) {
                    Button("Cancel", role: .cancel) { phaseToDelete = nil }
                    Button("Delete", role: .destructive) {
                        if let p = phaseToDelete {
                            deletePhase(p)
                            phaseToDelete = nil
                        }
                    }
                } message: {
                    Text("This will remove the phase and all its items. This can’t be undone.")
                }
            }
        )
    }

    private func supportedMetricLabels(phase: RoadmapPhase, dashboard: PersonalDashboard) -> [String]? {
        guard let ids = phase.supportedMetricIds, !ids.isEmpty else { return nil }
        let labels = ids.compactMap { id in dashboard.metrics.first(where: { $0.id == id })?.label }
        return labels.isEmpty ? nil : labels
    }

    private var currentQuarterLabel: String {
        let month = Calendar.current.component(.month, from: Date())
        let q = (month - 1) / 3 + 1
        return "Q\(q)"
    }

    private func roadmapHeader() -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("Roadmap")
                .font(AppTheme.title2())
                .foregroundColor(AppTheme.textPrimary)
            Text("Phases & milestones")
                .font(AppTheme.caption1())
                .foregroundColor(AppTheme.textTertiary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, AppTheme.paddingScreen)
        .padding(.vertical, AppTheme.gridUnit)
        .background(AppTheme.background)
    }

    private func roadmapOverviewCard(_ dashboard: PersonalDashboard) -> some View {
        let (totalDone, totalItems, nextKey) = roadmapOverallProgress(dashboard)
        let nextText: String? = nextKey.flatMap { key in
            for phase in dashboard.roadmapPhases {
                let keys = orderedItemKeys(phase: phase, dashboard: dashboard)
                if keys.contains(key) {
                    let info = itemInfo(for: key, phase: phase, dashboard: dashboard)
                    return dashboard.roadmapItemText[key] ?? info.defaultText
                }
            }
            return nil
        }
        let pct = totalItems > 0 ? Int((Double(totalDone) / Double(totalItems)) * 100) : 0
        return SimpleCard(glow: true) {
            VStack(alignment: .leading, spacing: AppTheme.spacingTight) {
                HStack(alignment: .firstTextBaseline) {
                    Text("\(totalDone) / \(totalItems)")
                        .font(AppTheme.monoData(size: 28, weight: .semibold))
                        .foregroundColor(AppTheme.textPrimary)
                    Text("items done")
                        .font(AppTheme.footnote())
                        .foregroundColor(AppTheme.textTertiary)
                        .padding(.leading, 4)
                }
                PremiumProgressBar(progress: Double(pct), height: 6)
                if let next = nextText, !next.isEmpty {
                    HStack(spacing: 6) {
                        Text("Next:")
                            .font(AppTheme.caption1(.medium))
                            .foregroundColor(AppTheme.textTertiary)
                        Text(next)
                            .font(AppTheme.subheadline(.medium))
                            .foregroundColor(AppTheme.accent)
                            .lineLimit(2)
                            .glowAccent(radius: 6, opacity: 0.2)
                    }
                }
                if let dir = dashboard.directive, !dir.isEmpty {
                    Text(dir)
                        .font(AppTheme.caption2())
                        .foregroundColor(AppTheme.textQuaternary)
                        .italic()
                        .lineLimit(2)
                }
            }
        }
        .glowAccent(radius: 20, opacity: 0.12)
    }

    private func roadmapOverallProgress(_ dashboard: PersonalDashboard) -> (done: Int, total: Int, nextKey: String?) {
        var done = 0, total = 0
        var nextKey: String? = nil
        for phase in dashboard.roadmapPhases {
            for key in orderedItemKeys(phase: phase, dashboard: dashboard) {
                total += 1
                if dashboard.roadmapCompleted[key] == true { done += 1 }
                else if nextKey == nil { nextKey = key }
            }
        }
        return (done, total, nextKey)
    }

    private func deletePhase(_ phase: RoadmapPhase) {
        store.updateDashboard { d in
            d.roadmapPhases.removeAll { $0.id == phase.id }
            let keysToRemove = (phase.items.indices.map { "\(phase.id)-\($0)" })
                + ((d.roadmapAdded[phase.id] ?? []).indices.map { "\(phase.id)-add-\($0)" })
            for key in keysToRemove {
                d.roadmapCompleted[key] = nil
                d.roadmapItemText[key] = nil
                d.roadmapDeleted[key] = nil
                d.roadmapItemDueDate?[key] = nil
                d.roadmapItemStatus?[key] = nil
            }
            d.roadmapAdded[phase.id] = nil
            d.roadmapOrder?[phase.id] = nil
            d.roadmapPhaseCollapsed?[phase.id] = nil
        }
    }

    private func formatPhaseDateRange(_ phase: RoadmapPhase) -> String? {
        guard let start = phase.startDate, let end = phase.endDate else { return nil }
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        f.timeZone = TimeZone.current
        guard let d1 = f.date(from: String(start.prefix(10))), let d2 = f.date(from: String(end.prefix(10))) else { return nil }
        f.dateFormat = "MMM d"
        return "\(f.string(from: d1)) – \(f.string(from: d2))"
    }

    private func quarterTimeline(_ dashboard: PersonalDashboard) -> some View {
        let phases = dashboard.roadmapPhases
        guard !phases.isEmpty else { return AnyView(EmptyView()) }
        return AnyView(
            VStack(alignment: .leading, spacing: AppTheme.spacingStack) {
                Text("Timeline")
                    .font(AppTheme.caption1(.medium))
                    .foregroundColor(AppTheme.textTertiary)
                HStack(alignment: .center, spacing: 0) {
                    ForEach(Array(phases.enumerated()), id: \.element.id) { idx, phase in
                        if idx > 0 {
                            Rectangle()
                                .fill(AppTheme.glowColor.opacity(0.25))
                                .frame(height: 2)
                                .frame(maxWidth: .infinity)
                        }
                        VStack(spacing: 8) {
                            let isCurrent = phase.quarter.uppercased() == currentQuarterLabel
                            ZStack {
                                if isCurrent {
                                    Circle()
                                        .fill(AppTheme.glowColor.opacity(0.25))
                                        .frame(width: 36, height: 36)
                                        .blur(radius: 10)
                                }
                                Circle()
                                    .fill(isCurrent ? AppTheme.accent : AppTheme.surfaceElevated)
                                    .frame(width: 22, height: 22)
                                    .overlay(Circle().stroke(isCurrent ? AppTheme.glowColor : AppTheme.border, lineWidth: isCurrent ? 2 : 1))
                                    .shadow(color: isCurrent ? AppTheme.glowColor.opacity(0.7) : .clear, radius: 12, x: 0, y: 0)
                                    .shadow(color: isCurrent ? AppTheme.glowColor.opacity(0.35) : .clear, radius: 20, x: 0, y: 0)
                            }
                            Text(phase.quarter)
                                .font(AppTheme.monoData(size: 11, weight: .semibold))
                                .foregroundColor(isCurrent ? AppTheme.accent : AppTheme.textTertiary)
                        }
                        .frame(maxWidth: .infinity)
                        if idx < phases.count - 1 {
                            Rectangle()
                                .fill(AppTheme.glowColor.opacity(0.25))
                                .frame(height: 2)
                                .frame(maxWidth: .infinity)
                        }
                    }
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 20)
                .background(AppTheme.surface.opacity(0.7))
                .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusCard).stroke(AppTheme.glowColor.opacity(0.25), lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusCard))
                .shadow(color: AppTheme.glowColor.opacity(0.15), radius: 20, x: 0, y: 0)
            }
        )
    }

    private func phaseCard(_ phase: RoadmapPhase, qIdx: Int, dashboard: PersonalDashboard) -> some View {
        let (completed, total) = phaseProgress(phase, dashboard: dashboard)
        let percent = total > 0 ? Int((Double(completed) / Double(total)) * 100) : 0
        let newText = Binding(
            get: { newItemText[phase.id] ?? "" },
            set: { newItemText[phase.id] = $0 }
        )
        let isCurrentQuarter = phase.quarter.uppercased() == currentQuarterLabel
        let isCollapsed = dashboard.roadmapPhaseCollapsed?[phase.id] == true
        return SimpleCard(glow: isCurrentQuarter) {
            VStack(alignment: .leading, spacing: AppTheme.spacingTight) {
                // Top row: quarter, dates, progress, actions
                HStack(alignment: .center, spacing: 8) {
                    Button {
                        let current = dashboard.roadmapPhaseCollapsed?[phase.id] ?? false
                        store.updateDashboard { d in
                            if d.roadmapPhaseCollapsed == nil { d.roadmapPhaseCollapsed = [:] }
                            d.roadmapPhaseCollapsed?[phase.id] = !current
                        }
                        Haptic.light()
                    } label: {
                        Image(systemName: isCollapsed ? "chevron.right" : "chevron.down")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(AppTheme.textTertiary)
                            .frame(width: 24, height: 24)
                    }
                    .buttonStyle(PremiumButtonStyle())
                    HStack(spacing: 6) {
                        Text(phase.quarter)
                            .font(AppTheme.monoData(size: 12, weight: .semibold))
                            .foregroundColor(isCurrentQuarter ? .black : AppTheme.textSecondary)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(isCurrentQuarter ? AppTheme.accent : Color.clear)
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusPill))
                            .shadow(color: isCurrentQuarter ? AppTheme.glowColor.opacity(0.4) : .clear, radius: 6, x: 0, y: 0)
                        if isCurrentQuarter {
                            Text("You're here")
                                .font(AppTheme.caption2(.medium))
                                .foregroundColor(AppTheme.accent)
                                .glowAccent(radius: 6, opacity: 0.3)
                        }
                        if let range = formatPhaseDateRange(phase) {
                            Text(range)
                                .font(AppTheme.monoData(size: 10, weight: .regular))
                                .foregroundColor(AppTheme.textQuaternary)
                        }
                    }
                    Spacer()
                    Text("\(completed) / \(total)")
                        .font(AppTheme.monoData(size: 13, weight: .medium))
                        .foregroundColor(AppTheme.textTertiary)
                    Button(reorderPhaseId == phase.id ? "Done" : "Reorder") {
                        withAnimation(AppTheme.spring) { reorderPhaseId = reorderPhaseId == phase.id ? nil : phase.id }
                        Haptic.light()
                    }
                    .font(AppTheme.caption2(.medium))
                    .foregroundColor(AppTheme.accent)
                    .buttonStyle(PremiumButtonStyle())
                    Button {
                        editingPhase = phase
                    } label: {
                        Image(systemName: "pencil")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(AppTheme.textTertiary)
                            .frame(width: 32, height: 32)
                    }
                    .buttonStyle(PremiumButtonStyle())
                    Button {
                        phaseToDelete = phase
                    } label: {
                        Image(systemName: "trash")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(AppTheme.destructive.opacity(0.9))
                            .frame(width: 32, height: 32)
                    }
                    .buttonStyle(PremiumButtonStyle())
                }
                // Theme = hero title
                Text(phase.theme)
                    .font(AppTheme.headline())
                    .foregroundColor(AppTheme.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)
                Text(phase.goal)
                    .font(AppTheme.footnote())
                    .foregroundColor(AppTheme.textSecondary)
                    .italic()
                if !isCollapsed {
                    // Supports (metrics link)
                    if let labels = supportedMetricLabels(phase: phase, dashboard: dashboard), !labels.isEmpty {
                        HStack(alignment: .center, spacing: 6) {
                            Text("Supports:")
                                .font(AppTheme.caption2(.medium))
                                .foregroundColor(AppTheme.textTertiary)
                            Text(labels.joined(separator: ", "))
                                .font(AppTheme.caption2())
                                .foregroundColor(AppTheme.accent)
                            Spacer(minLength: 0)
                            Button("Link metrics") { linkingPhase = phase }
                                .font(AppTheme.caption2(.medium))
                                .foregroundColor(AppTheme.accent)
                                .buttonStyle(PremiumButtonStyle())
                        }
                    } else {
                        Button("Link to metrics") { linkingPhase = phase }
                            .font(AppTheme.caption2(.medium))
                            .foregroundColor(AppTheme.textTertiary)
                            .buttonStyle(PremiumButtonStyle())
                    }
                    PremiumProgressBar(progress: Double(percent), height: 4)
                        .glowAccent(radius: 4, opacity: 0.15)
                    if total > 0 && completed < total {
                        Button("Mark phase complete") {
                            Haptic.medium()
                            store.updateDashboard { d in
                                for key in orderedItemKeys(phase: phase, dashboard: dashboard) {
                                    d.roadmapCompleted[key] = true
                                    d.roadmapItemStatus?[key] = "done"
                                }
                            }
                        }
                        .font(AppTheme.caption2(.medium))
                        .foregroundColor(AppTheme.accent)
                        .buttonStyle(PremiumButtonStyle())
                    }
                    // Mini-goals list
                    VStack(alignment: .leading, spacing: AppTheme.spacingTight) {
                        Text("Mini-goals")
                            .font(AppTheme.caption1(.medium))
                            .foregroundColor(AppTheme.textTertiary)
                        let nextKey = firstUncompletedKey(dashboard: dashboard)
                        let keys = orderedItemKeys(phase: phase, dashboard: dashboard)
                        List {
                            ForEach(Array(keys.enumerated()), id: \.element) { index, key in
                                roadmapRowForKey(key, phase: phase, dashboard: dashboard, isNext: nextKey == key, index: index + 1)
                                    .listRowBackground(Color.clear)
                                    .listRowSeparator(.hidden)
                                    .listRowInsets(EdgeInsets(top: 6, leading: 0, bottom: 6, trailing: 0))
                            }
                            .onMove { source, dest in
                                moveItems(phase: phase, from: source, to: dest)
                            }
                        }
                        .listStyle(.plain)
                        .environment(\.editMode, .constant(reorderPhaseId == phase.id ? .active : .inactive))
                        addItemRow(phaseId: phase.id, text: newText)
                    }
                }
            }
        }
        .glowAccent(radius: isCurrentQuarter ? 24 : 0, opacity: isCurrentQuarter ? 0.18 : 0.02)
    }

    private func addItemRow(phaseId: String, text: Binding<String>) -> some View {
        let isEmpty = text.wrappedValue.trimmingCharacters(in: .whitespaces).isEmpty
        return HStack(spacing: AppTheme.spacingStack) {
            TextField("New mini-goal...", text: text)
                .font(AppTheme.body())
                .foregroundColor(AppTheme.textPrimary)
                .padding(AppTheme.paddingCard - 4)
                .background(AppTheme.surfaceElevated)
                .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.border, lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
            Button("Add") {
                let t = text.wrappedValue.trimmingCharacters(in: .whitespaces)
                if !t.isEmpty {
                    Haptic.medium()
                    store.updateDashboard { d in
                        var list = d.roadmapAdded[phaseId] ?? []
                        list.append(t)
                        d.roadmapAdded[phaseId] = list
                        let newKey = "\(phaseId)-add-\(list.count - 1)"
                        if d.roadmapOrder != nil, var order = d.roadmapOrder?[phaseId] {
                            order.append(newKey)
                            d.roadmapOrder?[phaseId] = order
                        }
                    }
                    text.wrappedValue = ""
                }
            }
            .font(AppTheme.footnote(.semibold))
            .foregroundColor(isEmpty ? AppTheme.textTertiary : .black)
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(isEmpty ? AppTheme.surfaceElevated : AppTheme.accent)
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusPill))
            .disabled(isEmpty)
            .opacity(isEmpty ? 0.7 : 1)
            .glowAccent(radius: 6, opacity: isEmpty ? 0 : 0.25)
            .buttonStyle(PremiumButtonStyle())
        }
        .padding(.vertical, AppTheme.spacingTight)
    }

    private func defaultOrder(phase: RoadmapPhase, dashboard: PersonalDashboard) -> [String] {
        var keys: [String] = []
        for (idx, _) in phase.items.enumerated() {
            let key = "\(phase.id)-\(idx)"
            if dashboard.roadmapDeleted[key] != true { keys.append(key) }
        }
        let added = dashboard.roadmapAdded[phase.id] ?? []
        for idx in added.indices {
            let key = "\(phase.id)-add-\(idx)"
            if dashboard.roadmapDeleted[key] != true { keys.append(key) }
        }
        return keys
    }

    private func orderedItemKeys(phase: RoadmapPhase, dashboard: PersonalDashboard) -> [String] {
        let stored = dashboard.roadmapOrder?[phase.id]
        if let order = stored, !order.isEmpty {
            return order.filter { dashboard.roadmapDeleted[$0] != true }
        }
        return defaultOrder(phase: phase, dashboard: dashboard)
    }

    private func moveItems(phase: RoadmapPhase, from source: IndexSet, to destination: Int) {
        guard let dashboard = store.dashboard else { return }
        var keys = orderedItemKeys(phase: phase, dashboard: dashboard)
        keys.move(fromOffsets: source, toOffset: destination)
        Haptic.light()
        store.updateDashboard { d in
            if d.roadmapOrder == nil { d.roadmapOrder = [:] }
            d.roadmapOrder?[phase.id] = keys
        }
    }

    private func itemInfo(for key: String, phase: RoadmapPhase, dashboard: PersonalDashboard) -> (itemIndex: Int, addedIndex: Int?, defaultText: String) {
        let prefix = phase.id + "-add-"
        if key.hasPrefix(prefix) {
            let suf = String(key.dropFirst(prefix.count))
            let idx = Int(suf) ?? 0
            let text = dashboard.roadmapAdded[phase.id]?[idx] ?? ""
            return (-1, idx, text)
        }
        let basePrefix = phase.id + "-"
        if key.hasPrefix(basePrefix) {
            let suf = String(key.dropFirst(basePrefix.count))
            let idx = Int(suf) ?? 0
            let text = phase.items.indices.contains(idx) ? phase.items[idx] : ""
            return (idx, nil, text)
        }
        return (-1, nil, "")
    }

    private func firstUncompletedKey(dashboard: PersonalDashboard) -> String? {
        for phase in dashboard.roadmapPhases {
            for key in orderedItemKeys(phase: phase, dashboard: dashboard) {
                if dashboard.roadmapCompleted[key] != true { return key }
            }
        }
        return nil
    }

    private func roadmapRowForKey(_ key: String, phase: RoadmapPhase, dashboard: PersonalDashboard, isNext: Bool, index: Int) -> some View {
        let info = itemInfo(for: key, phase: phase, dashboard: dashboard)
        return roadmapRow(phaseId: phase.id, itemIndex: info.itemIndex, addedIndex: info.addedIndex, defaultText: info.defaultText, dashboard: dashboard, isNext: isNext, index: index)
    }

    private func roadmapRow(phaseId: String, itemIndex: Int, addedIndex: Int?, defaultText: String, dashboard: PersonalDashboard, isNext: Bool = false, index: Int = 0) -> some View {
        let key = addedIndex != nil ? "\(phaseId)-add-\(addedIndex!)" : "\(phaseId)-\(itemIndex)"
        let isCompleted = dashboard.roadmapCompleted[key] ?? false
        let displayText = dashboard.roadmapItemText[key] ?? defaultText
        let dueDate = dashboard.roadmapItemDueDate?[key] ?? ""
        let status = dashboard.roadmapItemStatus?[key] ?? "todo"
        let isOverdue = isDueOverdue(dueDate)
        return Button {
            Haptic.light()
            editingItem = RoadmapEditItem(key: key, initialText: displayText, initialDueDate: dueDate, initialStatus: status)
        } label: {
            HStack(alignment: .center, spacing: 12) {
                Button {
                    let willComplete = !(dashboard.roadmapCompleted[key] ?? false)
                    Haptic.light()
                    withAnimation(AppTheme.spring) {
                        store.updateDashboard { d in
                            d.roadmapCompleted[key] = !(d.roadmapCompleted[key] ?? false)
                            if d.roadmapItemStatus == nil { d.roadmapItemStatus = [:] }
                            d.roadmapItemStatus?[key] = willComplete ? "done" : nil
                        }
                    }
                    if willComplete { Haptic.success() }
                } label: {
                    Image(systemName: isCompleted ? "checkmark.circle.fill" : "circle")
                        .font(.system(size: 22))
                        .foregroundColor(isCompleted ? AppTheme.accent : AppTheme.textQuaternary)
                        .shadow(color: isCompleted ? AppTheme.glowColor.opacity(0.5) : .clear, radius: 6, x: 0, y: 0)
                }
                .buttonStyle(PremiumButtonStyle())
                VStack(alignment: .leading, spacing: 4) {
                    HStack(alignment: .center, spacing: 8) {
                        Text("\(index)")
                            .font(AppTheme.monoData(size: 12, weight: .medium))
                            .foregroundColor(AppTheme.textTertiary)
                            .frame(width: 18, alignment: .trailing)
                        if isNext {
                            Text("Next")
                                .font(AppTheme.monoData(size: 10, weight: .semibold))
                                .foregroundColor(.black)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(AppTheme.accent)
                                .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusPill))
                                .glowAccent(radius: 6, opacity: 0.35)
                        }
                        if status == "in_progress" && !isCompleted {
                            Text("In progress")
                                .font(AppTheme.monoData(size: 9, weight: .medium))
                                .foregroundColor(AppTheme.accent)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(AppTheme.accentSubtle)
                                .clipShape(RoundedRectangle(cornerRadius: 4))
                        }
                        Text(displayText)
                            .font(AppTheme.subheadline())
                            .strikethrough(isCompleted)
                            .foregroundColor(isCompleted ? AppTheme.textTertiary : AppTheme.textPrimary)
                            .multilineTextAlignment(.leading)
                            .lineLimit(3)
                    }
                    if !dueDate.isEmpty {
                        Text(formatItemDueDate(dueDate))
                            .font(AppTheme.monoData(size: 10, weight: .regular))
                            .foregroundColor(isOverdue ? AppTheme.destructive : AppTheme.textQuaternary)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(AppTheme.textQuaternary)
            }
            .padding(.vertical, 12)
            .padding(.horizontal, 12)
            .background(AppTheme.surfaceElevated)
            .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.border, lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
            .contentShape(Rectangle())
        }
        .buttonStyle(PremiumButtonStyle())
        .overlay(alignment: .topTrailing) {
            Button {
                store.updateDashboard { d in
                    if addedIndex != nil {
                        d.roadmapDeleted["\(phaseId)-add-\(addedIndex!)"] = true
                    } else {
                        d.roadmapDeleted[key] = true
                    }
                    d.roadmapItemDueDate?[key] = nil
                    d.roadmapItemStatus?[key] = nil
                    if d.roadmapOrder == nil { d.roadmapOrder = [:] }
                    d.roadmapOrder?[phaseId]?.removeAll { $0 == key }
                    if d.roadmapOrder?[phaseId]?.isEmpty == true { d.roadmapOrder?[phaseId] = nil }
                }
            } label: {
                Image(systemName: "xmark.circle.fill")
                    .font(.system(size: 20))
                    .foregroundColor(AppTheme.textQuaternary)
                    .symbolRenderingMode(.hierarchical)
            }
            .buttonStyle(PremiumButtonStyle())
            .padding(8)
        }
    }

    private func isDueOverdue(_ dateStr: String) -> Bool {
        guard !dateStr.isEmpty else { return false }
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        f.timeZone = TimeZone.current
        guard let d = f.date(from: String(dateStr.prefix(10))) else { return false }
        return d < Calendar.current.startOfDay(for: Date())
    }

    private func formatItemDueDate(_ dateStr: String) -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        f.timeZone = TimeZone.current
        guard let d = f.date(from: String(dateStr.prefix(10))) else { return dateStr }
        f.dateFormat = "MMM d, yyyy"
        return f.string(from: d)
    }

    private func phaseProgress(_ phase: RoadmapPhase, dashboard: PersonalDashboard) -> (completed: Int, total: Int) {
        var completed = 0
        var total = 0
        for (idx, _) in phase.items.enumerated() {
            if dashboard.roadmapDeleted["\(phase.id)-\(idx)"] == true { continue }
            total += 1
            if dashboard.roadmapCompleted["\(phase.id)-\(idx)"] == true { completed += 1 }
        }
        let added = dashboard.roadmapAdded[phase.id] ?? []
        for idx in added.indices {
            if dashboard.roadmapDeleted["\(phase.id)-add-\(idx)"] == true { continue }
            total += 1
            if dashboard.roadmapCompleted["\(phase.id)-add-\(idx)"] == true { completed += 1 }
        }
        return (completed, total)
    }
}

// MARK: - Edit roadmap item sheet
struct EditRoadmapItemSheet: View {
    let key: String
    let initialText: String
    let initialDueDate: String
    let initialStatus: String
    let onSave: (String, String, String) -> Void
    let onCancel: () -> Void
    @State private var text: String = ""
    @State private var dueDate: String = ""
    @State private var status: String = "todo"

    var body: some View {
        NavigationView {
            ZStack {
                AppTheme.background.ignoresSafeArea()
                VStack(alignment: .leading, spacing: AppTheme.spacingSection) {
                    Text("What’s this mini-goal?")
                        .font(AppTheme.footnote())
                        .foregroundColor(AppTheme.textSecondary)
                    TextField("Mini-goal", text: $text)
                        .font(AppTheme.body())
                        .foregroundColor(AppTheme.textPrimary)
                        .padding(AppTheme.paddingCard)
                        .background(AppTheme.surfaceElevated)
                        .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.border, lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
                    SectionLabel(text: "Due date (optional)")
                    TextField("YYYY-MM-DD", text: $dueDate)
                        .font(AppTheme.monoData(size: 16))
                        .foregroundColor(AppTheme.textPrimary)
                        .padding(AppTheme.paddingCard)
                        .background(AppTheme.surfaceElevated)
                        .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.border, lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
                    SectionLabel(text: "Status")
                    Picker("Status", selection: $status) {
                        Text("Todo").tag("todo")
                        Text("In progress").tag("in_progress")
                        Text("Done").tag("done")
                    }
                    .pickerStyle(.segmented)
                    .colorMultiply(AppTheme.accent)
                    Spacer()
                }
                .padding(AppTheme.paddingScreen)
            }
            .navigationTitle("Edit mini-goal")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                text = initialText
                dueDate = initialDueDate
                status = initialStatus.isEmpty ? "todo" : initialStatus
            }
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { onCancel() }
                        .font(AppTheme.body())
                        .foregroundColor(AppTheme.textSecondary)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Haptic.success()
                        onSave(
                            text.trimmingCharacters(in: .whitespaces),
                            dueDate.trimmingCharacters(in: .whitespaces),
                            status
                        )
                    }
                    .font(AppTheme.headline(.semibold))
                    .foregroundColor(AppTheme.accent)
                }
            }
        }
    }
}

// MARK: - Link metrics sheet (phase ↔ dashboard metrics)
struct LinkMetricsSheet: View {
    let phase: RoadmapPhase
    let dashboard: PersonalDashboard
    let onSave: ([String]) -> Void
    let onCancel: () -> Void
    @State private var selectedIds: Set<String> = []

    var body: some View {
        NavigationView {
            ZStack {
                AppTheme.background.ignoresSafeArea()
                VStack(alignment: .leading, spacing: AppTheme.spacingSection) {
                    SectionLabel(text: "Link this phase to dashboard metrics")
                    Text("Select the metrics this phase supports.")
                        .font(AppTheme.footnote())
                        .foregroundColor(AppTheme.textSecondary)
                    if dashboard.metrics.isEmpty {
                        Text("No metrics yet. Add metrics on the Dashboard to link them.")
                            .font(AppTheme.body())
                            .foregroundColor(AppTheme.textTertiary)
                            .padding(.vertical, AppTheme.spacingSection)
                    } else {
                        VStack(spacing: AppTheme.spacingTight) {
                            ForEach(dashboard.metrics) { m in
                                Button {
                                    if selectedIds.contains(m.id) {
                                        selectedIds.remove(m.id)
                                    } else {
                                        selectedIds.insert(m.id)
                                    }
                                    Haptic.light()
                                } label: {
                                    HStack(spacing: 12) {
                                        Image(systemName: selectedIds.contains(m.id) ? "checkmark.circle.fill" : "circle")
                                            .font(.system(size: 20))
                                            .foregroundColor(selectedIds.contains(m.id) ? AppTheme.accent : AppTheme.textQuaternary)
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(m.label)
                                                .font(AppTheme.subheadline(.medium))
                                                .foregroundColor(AppTheme.textPrimary)
                                            if let code = m.code, !code.isEmpty {
                                                Text(code)
                                                    .font(AppTheme.monoData(size: 11, weight: .regular))
                                                    .foregroundColor(AppTheme.textTertiary)
                                            }
                                        }
                                        Spacer()
                                    }
                                    .padding(AppTheme.paddingCard - 4)
                                    .background(AppTheme.surfaceElevated)
                                    .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(selectedIds.contains(m.id) ? AppTheme.accent.opacity(0.4) : AppTheme.border, lineWidth: 1))
                                    .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
                                }
                                .buttonStyle(PremiumButtonStyle())
                            }
                        }
                    }
                    Spacer()
                }
                .padding(AppTheme.paddingScreen)
            }
            .navigationTitle("Link to metrics")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear { selectedIds = Set(phase.supportedMetricIds ?? []) }
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { onCancel() }
                        .font(AppTheme.body())
                        .foregroundColor(AppTheme.textSecondary)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Haptic.success()
                        onSave(Array(selectedIds))
                    }
                    .font(AppTheme.headline(.semibold))
                    .foregroundColor(AppTheme.accent)
                }
            }
        }
    }
}

// MARK: - Edit phase sheet
struct EditPhaseSheet: View {
    let phase: RoadmapPhase
    let onSave: (RoadmapPhase) -> Void
    let onCancel: () -> Void
    @State private var quarter: String = ""
    @State private var theme: String = ""
    @State private var goal: String = ""
    @State private var startDate: String = ""
    @State private var endDate: String = ""

    var body: some View {
        NavigationView {
            ZStack {
                AppTheme.background.ignoresSafeArea()
                VStack(alignment: .leading, spacing: AppTheme.spacingSection) {
                    SectionLabel(text: "Quarter / label")
                    TextField("e.g. Q1", text: $quarter)
                        .font(AppTheme.body())
                        .foregroundColor(AppTheme.textPrimary)
                        .padding(AppTheme.paddingCard)
                        .background(AppTheme.surfaceElevated)
                        .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.border, lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
                    SectionLabel(text: "Theme")
                    TextField("Phase theme", text: $theme)
                        .font(AppTheme.body())
                        .foregroundColor(AppTheme.textPrimary)
                        .padding(AppTheme.paddingCard)
                        .background(AppTheme.surfaceElevated)
                        .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.border, lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
                    SectionLabel(text: "Goal")
                    TextField("Phase goal", text: $goal)
                        .font(AppTheme.body())
                        .foregroundColor(AppTheme.textPrimary)
                        .padding(AppTheme.paddingCard)
                        .background(AppTheme.surfaceElevated)
                        .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.border, lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
                    SectionLabel(text: "Date range (optional)")
                    HStack(spacing: 12) {
                        TextField("Start YYYY-MM-DD", text: $startDate)
                            .font(AppTheme.monoData(size: 14))
                            .foregroundColor(AppTheme.textPrimary)
                            .padding(12)
                            .background(AppTheme.surfaceElevated)
                            .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.border, lineWidth: 1))
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
                        TextField("End YYYY-MM-DD", text: $endDate)
                            .font(AppTheme.monoData(size: 14))
                            .foregroundColor(AppTheme.textPrimary)
                            .padding(12)
                            .background(AppTheme.surfaceElevated)
                            .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.border, lineWidth: 1))
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
                    }
                    Spacer()
                }
                .padding(AppTheme.paddingScreen)
            }
            .navigationTitle("Edit phase")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                quarter = phase.quarter
                theme = phase.theme
                goal = phase.goal
                startDate = phase.startDate ?? ""
                endDate = phase.endDate ?? ""
            }
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { onCancel() }
                        .font(AppTheme.body())
                        .foregroundColor(AppTheme.textSecondary)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Haptic.success()
                        var updated = phase
                        updated.quarter = quarter.trimmingCharacters(in: .whitespaces)
                        updated.theme = theme.trimmingCharacters(in: .whitespaces)
                        updated.goal = goal.trimmingCharacters(in: .whitespaces)
                        updated.startDate = startDate.trimmingCharacters(in: .whitespaces).isEmpty ? nil : startDate.trimmingCharacters(in: .whitespaces)
                        updated.endDate = endDate.trimmingCharacters(in: .whitespaces).isEmpty ? nil : endDate.trimmingCharacters(in: .whitespaces)
                        onSave(updated)
                    }
                    .font(AppTheme.headline(.semibold))
                    .foregroundColor(AppTheme.accent)
                }
            }
        }
    }
}

// MARK: - Add phase sheet
struct AddPhaseSheet: View {
    let existingPhases: [RoadmapPhase]
    let onAdd: (RoadmapPhase) -> Void
    let onCancel: () -> Void
    @State private var quarter: String = ""
    @State private var theme: String = ""
    @State private var goal: String = ""
    @State private var startDate: String = ""
    @State private var endDate: String = ""

    var body: some View {
        NavigationView {
            ZStack {
                AppTheme.background.ignoresSafeArea()
                VStack(alignment: .leading, spacing: AppTheme.spacingSection) {
                    SectionLabel(text: "Quarter / label")
                    TextField("e.g. Q5 or Phase 5", text: $quarter)
                        .font(AppTheme.body())
                        .foregroundColor(AppTheme.textPrimary)
                        .padding(AppTheme.paddingCard)
                        .background(AppTheme.surfaceElevated)
                        .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.border, lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
                    SectionLabel(text: "Theme")
                    TextField("Phase theme", text: $theme)
                        .font(AppTheme.body())
                        .foregroundColor(AppTheme.textPrimary)
                        .padding(AppTheme.paddingCard)
                        .background(AppTheme.surfaceElevated)
                        .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.border, lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
                    SectionLabel(text: "Goal")
                    TextField("Phase goal", text: $goal)
                        .font(AppTheme.body())
                        .foregroundColor(AppTheme.textPrimary)
                        .padding(AppTheme.paddingCard)
                        .background(AppTheme.surfaceElevated)
                        .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.border, lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
                    SectionLabel(text: "Date range (optional)")
                    HStack(spacing: 12) {
                        TextField("Start YYYY-MM-DD", text: $startDate)
                            .font(AppTheme.monoData(size: 14))
                            .foregroundColor(AppTheme.textPrimary)
                            .padding(12)
                            .background(AppTheme.surfaceElevated)
                            .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.border, lineWidth: 1))
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
                        TextField("End YYYY-MM-DD", text: $endDate)
                            .font(AppTheme.monoData(size: 14))
                            .foregroundColor(AppTheme.textPrimary)
                            .padding(12)
                            .background(AppTheme.surfaceElevated)
                            .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.border, lineWidth: 1))
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
                    }
                    Spacer()
                }
                .padding(AppTheme.paddingScreen)
            }
            .navigationTitle("Add phase")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { onCancel() }
                        .font(AppTheme.body())
                        .foregroundColor(AppTheme.textSecondary)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        Haptic.success()
                        let id = "phase-\(Int(Date().timeIntervalSince1970 * 1000))"
                        let newPhase = RoadmapPhase(
                            id: id,
                            quarter: quarter.trimmingCharacters(in: .whitespaces).isEmpty ? "New" : quarter.trimmingCharacters(in: .whitespaces),
                            theme: theme.trimmingCharacters(in: .whitespaces).isEmpty ? "New phase" : theme.trimmingCharacters(in: .whitespaces),
                            goal: goal.trimmingCharacters(in: .whitespaces).isEmpty ? "Set your goal" : goal.trimmingCharacters(in: .whitespaces),
                            items: [],
                            supportedMetricIds: nil,
                            startDate: startDate.trimmingCharacters(in: .whitespaces).isEmpty ? nil : startDate.trimmingCharacters(in: .whitespaces),
                            endDate: endDate.trimmingCharacters(in: .whitespaces).isEmpty ? nil : endDate.trimmingCharacters(in: .whitespaces)
                        )
                        onAdd(newPhase)
                    }
                    .font(AppTheme.headline(.semibold))
                    .foregroundColor(AppTheme.accent)
                    .disabled(theme.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }
}
