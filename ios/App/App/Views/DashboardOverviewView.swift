import SwiftUI

struct DashboardOverviewView: View {
    @EnvironmentObject var store: DashboardStore
    @State private var showSetToday = false
    @State private var showSetTomorrow = false
    @State private var newTodayText = ""
    @State private var newTomorrowText = ""
    @State private var showEditMetrics = false
    @State private var showEditDirective = false
    @State private var editingDirective = ""
    @State private var showSavedToast = false
    @State private var justCompletedMetricId: String? = nil

    var body: some View {
        guard let dashboard = store.dashboard else { return AnyView(EmptyView()) }
        return AnyView(
            MatrixScreen {
                VStack(spacing: 0) {
                    header(dashboard)
                    ScrollView(.vertical, showsIndicators: false) {
                        VStack(alignment: .leading, spacing: AppTheme.spacingSection) {
                            directiveSection(dashboard)
                            todaySection(dashboard)
                            if dashboard.attackToday != nil {
                                tomorrowLine(dashboard)
                            }
                            metricsSection(dashboard)
                        }
                        .padding(AppTheme.paddingScreen)
                        .padding(.bottom, AppTheme.gridUnit * 2)
                    }
                }
                .sheet(isPresented: $showEditMetrics) {
                    EditMetricsSheet(dashboard: dashboard, onDismiss: { showEditMetrics = false })
                        .environmentObject(store)
                }
                .sheet(isPresented: $showEditDirective) {
                    EditDirectiveSheet(
                        directive: dashboard.directive ?? "",
                        onSave: { newValue in
                            store.updateDashboard { $0.directive = newValue.isEmpty ? nil : newValue }
                            showEditDirective = false
                            Haptic.success()
                            showSavedToast = true
                            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { showSavedToast = false }
                        },
                        onCancel: { showEditDirective = false }
                    )
                }
                .overlay(savedToastOverlay)
            }
        )
    }

    private var savedToastOverlay: some View {
        VStack {
            Spacer()
            if showSavedToast {
                HStack(spacing: 8) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 18))
                    Text("Saved")
                        .font(AppTheme.subheadline(.semibold))
                }
                .foregroundColor(.black)
                .padding(.horizontal, 24)
                .padding(.vertical, 14)
                .background(AppTheme.accent)
                .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusButton))
                .glowAccent(radius: 16, opacity: 0.4)
                .transition(.opacity.combined(with: .scale(scale: 0.92)))
                .padding(.bottom, 48)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .animation(AppTheme.spring, value: showSavedToast)
        .allowsHitTesting(false)
    }

    private func header(_ dashboard: PersonalDashboard) -> some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 2) {
                Text(dashboard.name)
                    .font(AppTheme.title2())
                    .foregroundColor(AppTheme.textPrimary)
                Text(formattedTime())
                    .font(AppTheme.caption1())
                    .foregroundColor(AppTheme.textTertiary)
            }
            Spacer()
            Button {
                Haptic.light()
                showEditMetrics = true
            } label: {
                Image(systemName: "gearshape.fill")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(AppTheme.textSecondary)
                    .frame(width: AppTheme.minTouchTarget, height: AppTheme.minTouchTarget)
            }
            .buttonStyle(PremiumButtonStyle())
        }
        .padding(.horizontal, AppTheme.paddingScreen)
        .padding(.vertical, AppTheme.gridUnit)
        .background(AppTheme.background)
    }

    private func formattedTime() -> String {
        let f = DateFormatter()
        f.dateFormat = "HH:mm:ss"
        return f.string(from: Date())
    }

    private func directiveSection(_ dashboard: PersonalDashboard) -> some View {
        Group {
            if let dir = dashboard.directive, !dir.isEmpty {
                SimpleCard(glow: true) {
                    VStack(alignment: .leading, spacing: AppTheme.spacingTight) {
                        SectionLabel(text: "Vision")
                        Text(dir)
                            .font(AppTheme.body(.medium))
                            .foregroundColor(AppTheme.textPrimary)
                            .fixedSize(horizontal: false, vertical: true)
                            .lineSpacing(4)
                        Button {
                            editingDirective = dir
                            showEditDirective = true
                        } label: {
                            Text("Edit")
                                .font(AppTheme.footnote(.medium))
                                .foregroundColor(AppTheme.accent)
                        }
                        .buttonStyle(PremiumButtonStyle())
                    }
                }
            } else {
                Button {
                    editingDirective = ""
                    showEditDirective = true
                } label: {
                    SimpleCard {
                        HStack(spacing: 12) {
                            Image(systemName: "plus.circle")
                                .font(.system(size: 20, weight: .medium))
                                .foregroundColor(AppTheme.accent)
                            Text("Set your vision")
                                .font(AppTheme.body())
                                .foregroundColor(AppTheme.textSecondary)
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(AppTheme.textQuaternary)
                        }
                    }
                }
                .buttonStyle(PremiumButtonStyle())
            }
        }
    }

    private func todaySection(_ dashboard: PersonalDashboard) -> some View {
        let hasFocus = dashboard.attackToday != nil
        let isCompleted = dashboard.attackToday?.completed == true
        return SimpleCard(glow: hasFocus) {
            VStack(alignment: .leading, spacing: AppTheme.spacingStack) {
                HStack {
                    SectionLabel(text: "Today")
                    if isCompleted {
                        HStack(spacing: 4) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 12))
                                .foregroundColor(AppTheme.accent)
                            Text("Done")
                                .font(AppTheme.caption1(.semibold))
                                .foregroundColor(AppTheme.accent)
                        }
                        .glowAccent(radius: 6, opacity: 0.25)
                    }
                }
                if let today = dashboard.attackToday {
                    Button {
                        Haptic.light()
                        withAnimation(AppTheme.spring) {
                            store.updateDashboard { d in
                                if var t = d.attackToday { t.completed.toggle(); d.attackToday = t }
                            }
                        }
                        if !today.completed { Haptic.success() }
                    } label: {
                        HStack(alignment: .center, spacing: 16) {
                            Image(systemName: today.completed ? "checkmark.circle.fill" : "circle")
                                .font(.system(size: 28))
                                .foregroundColor(today.completed ? AppTheme.accent : AppTheme.textQuaternary)
                                .shadow(color: today.completed ? AppTheme.glowColor.opacity(0.5) : .clear, radius: 8, x: 0, y: 0)
                            Text(today.text)
                                .font(AppTheme.body())
                                .strikethrough(today.completed)
                                .foregroundColor(today.completed ? AppTheme.textTertiary : AppTheme.textPrimary)
                                .multilineTextAlignment(.leading)
                            Spacer(minLength: 0)
                        }
                        .padding(.vertical, 4)
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(PremiumButtonStyle())
                    if today.completed, dashboard.attackTomorrow == nil {
                        Button {
                            store.updateDashboard { d in
                                let tomorrowDate = Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date()
                                let dateStr = String(ISO8601DateFormatter().string(from: tomorrowDate).prefix(10))
                                d.attackTomorrow = AttackItem(text: today.text, date: dateStr)
                            }
                            Haptic.success()
                        } label: {
                            HStack(spacing: 8) {
                                Image(systemName: "arrow.right.circle")
                                    .font(.system(size: 16))
                                Text("Move to tomorrow")
                                    .font(AppTheme.footnote(.semibold))
                            }
                            .foregroundColor(AppTheme.accent)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(AppTheme.accentSubtle)
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
                            .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.accent.opacity(0.3), lineWidth: 1))
                        }
                        .buttonStyle(PremiumButtonStyle())
                        .glowAccent(radius: 8, opacity: 0.15)
                        .padding(.top, 4)
                    }
                } else if showSetToday {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("What's your one thing today?")
                            .font(AppTheme.subheadline())
                            .foregroundColor(AppTheme.textSecondary)
                        TextField("e.g. Ship the login flow", text: $newTodayText)
                            .font(AppTheme.body())
                            .foregroundColor(AppTheme.textPrimary)
                            .padding(16)
                            .background(AppTheme.surfaceElevated)
                            .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.border, lineWidth: 1))
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
                        HStack(spacing: 12) {
                            Button("Done") {
                                let t = newTodayText.trimmingCharacters(in: .whitespaces)
                                if !t.isEmpty {
                                    let date = String(ISO8601DateFormatter().string(from: Date()).prefix(10))
                                    store.updateDashboard { $0.attackToday = .init(text: t, completed: false, date: date) }
                                    newTodayText = ""
                                    showSetToday = false
                                }
                            }
                            .font(AppTheme.headline(.medium))
                            .foregroundColor(AppTheme.accent)
                            Button("Skip") { showSetToday = false; newTodayText = "" }
                                .font(AppTheme.body())
                                .foregroundColor(AppTheme.textTertiary)
                        }
                    }
                } else {
                    Button {
                        showSetToday = true
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: "plus.circle.fill")
                                .font(.system(size: 22))
                                .foregroundColor(AppTheme.accent)
                                .glowAccent(radius: 8, opacity: 0.3)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Add your one thing")
                                    .font(AppTheme.body(.medium))
                                    .foregroundColor(AppTheme.textPrimary)
                                Text("Tap to set what matters most today")
                                    .font(AppTheme.caption1())
                                    .foregroundColor(AppTheme.textTertiary)
                            }
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(AppTheme.textQuaternary)
                        }
                        .padding(.vertical, 8)
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(PremiumButtonStyle())
                }
            }
        }
    }

    private func tomorrowLine(_ dashboard: PersonalDashboard) -> some View {
        Group {
            if let tomorrow = dashboard.attackTomorrow {
                Text("Tomorrow: \(tomorrow.text)")
                    .font(AppTheme.footnote())
                    .foregroundColor(AppTheme.textSecondary)
                    .padding(.leading, 4)
            } else if showSetTomorrow {
                HStack(spacing: 12) {
                    TextField("Tomorrow's focus...", text: $newTomorrowText)
                        .font(AppTheme.subheadline())
                        .foregroundColor(AppTheme.textPrimary)
                        .padding(14)
                        .background(AppTheme.surfaceElevated)
                        .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.border, lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
                    Button("Set") {
                        let t = newTomorrowText.trimmingCharacters(in: .whitespaces)
                        if !t.isEmpty {
                            let d = Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date()
                            let date = String(ISO8601DateFormatter().string(from: d).prefix(10))
                            store.updateDashboard { $0.attackTomorrow = .init(text: t, date: date) }
                            newTomorrowText = ""
                            showSetTomorrow = false
                        }
                    }
                    .font(AppTheme.subheadline(.semibold))
                    .foregroundColor(AppTheme.accent)
                    .buttonStyle(PremiumButtonStyle())
                }
            } else {
                Button("Set tomorrow") { showSetTomorrow = true }
                    .font(AppTheme.footnote(.medium))
                    .foregroundColor(AppTheme.textTertiary)
                    .buttonStyle(PremiumButtonStyle())
            }
        }
    }

    private func metricsSection(_ dashboard: PersonalDashboard) -> some View {
        VStack(alignment: .leading, spacing: AppTheme.spacingStack) {
            HStack {
                SectionLabel(text: "Metrics")
                Spacer()
                if !dashboard.metrics.isEmpty {
                    Button("Add") {
                        showEditMetrics = true
                    }
                    .font(AppTheme.footnote(.medium))
                    .foregroundColor(AppTheme.accent)
                    .buttonStyle(PremiumButtonStyle())
                }
            }
            if !dashboard.metrics.isEmpty, let summary = metricsSummary(dashboard) {
                Text(summary)
                    .font(AppTheme.caption1())
                    .foregroundColor(AppTheme.textTertiary)
            }
            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: AppTheme.spacingStack),
                GridItem(.flexible(), spacing: AppTheme.spacingStack)
            ], spacing: AppTheme.spacingStack) {
                ForEach(dashboard.metrics) { m in
                    metricRow(m)
                }
            }
            if dashboard.metrics.isEmpty {
                Button {
                    showEditMetrics = true
                } label: {
                    SimpleCard(glow: true) {
                        VStack(alignment: .leading, spacing: 10) {
                            HStack(spacing: 12) {
                                Image(systemName: "plus.circle.fill")
                                    .font(.system(size: 22))
                                    .foregroundColor(AppTheme.accent)
                                    .glowAccent(radius: 8, opacity: 0.3)
                                Text("Add your first metric")
                                    .font(AppTheme.body())
                                    .foregroundColor(AppTheme.textSecondary)
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(AppTheme.textQuaternary)
                            }
                            Text("Tap the gear above to add or edit.")
                                .font(AppTheme.caption1())
                                .foregroundColor(AppTheme.textTertiary)
                        }
                    }
                }
                .buttonStyle(PremiumButtonStyle())
            }
        }
    }

    private func metricsSummary(_ dashboard: PersonalDashboard) -> String? {
        guard !dashboard.metrics.isEmpty else { return nil }
        var up = 0
        var atTarget = 0
        for m in dashboard.metrics {
            if m.target > 0 && m.current >= m.target { atTarget += 1 }
            else if m.current > m.previous { up += 1 }
        }
        var parts: [String] = []
        if atTarget > 0 { parts.append("\(atTarget) at target") }
        if up > 0 { parts.append("\(up) trending up") }
        if parts.isEmpty { return nil }
        return parts.joined(separator: " · ")
    }

    private func metricRow(_ m: DashboardMetric) -> some View {
        let progress = m.target > 0 ? min(100, Double(m.current) / Double(m.target) * 100) : 0
        let change = m.current - m.previous
        let changePct = m.previous != 0 ? Double(change) / Double(m.previous) * 100 : (m.current > 0 ? 100.0 : 0)
        let currentStr = formatValue(m.current)
        let targetStr = formatValue(m.target)
        return SimpleCard {
            VStack(alignment: .leading, spacing: AppTheme.spacingTight) {
                // Label
                Text(m.label)
                    .font(AppTheme.footnote(.medium))
                    .foregroundColor(AppTheme.textSecondary)
                    .lineLimit(1)
                if let code = m.code, !code.isEmpty {
                    Text(code)
                        .font(AppTheme.monoData(size: 10, weight: .medium))
                        .foregroundColor(AppTheme.textQuaternary)
                }
                // Hero number: current value (monospace, tabular)
                Text(currentStr)
                    .font(AppTheme.monoData(size: 24, weight: .semibold))
                    .foregroundColor(AppTheme.textPrimary)
                    .scaleEffect(justCompletedMetricId == m.id ? 1.08 : 1)
                    .animation(AppTheme.springSnappy, value: justCompletedMetricId)
                // Target line (monospace for alignment)
                Text("of \(targetStr) target")
                    .font(AppTheme.monoData(size: 12, weight: .regular))
                    .foregroundColor(AppTheme.textTertiary)
                PremiumProgressBar(progress: progress)
                // Footer: +1 and change
                HStack(alignment: .center, spacing: 8) {
                    Button {
                        Haptic.light()
                        justCompletedMetricId = m.id
                        withAnimation(AppTheme.springSnappy) {
                            store.updateDashboard { d in
                                guard let idx = d.metrics.firstIndex(where: { $0.id == m.id }) else { return }
                                let oldCurrent = d.metrics[idx].current
                                d.metrics[idx].previous = oldCurrent
                                d.metrics[idx].current = oldCurrent + 1
                            }
                        }
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { justCompletedMetricId = nil }
                    } label: {
                        Text("+1")
                            .font(AppTheme.monoData(size: 12, weight: .semibold))
                            .foregroundColor(.black)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(AppTheme.accent)
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusPill))
                            .glowAccent(radius: 6, opacity: 0.35)
                    }
                    .buttonStyle(PremiumButtonStyle())
                    Spacer(minLength: 0)
                    VStack(alignment: .trailing, spacing: 0) {
                        Text("\(Int(progress))%")
                            .font(AppTheme.monoData(size: 13, weight: .semibold))
                            .foregroundColor(AppTheme.accent)
                        if m.previous != 0 && abs(changePct) >= 0.01 {
                            Text(String(format: "%+.1f%% vs last", changePct))
                                .font(AppTheme.monoData(size: 10, weight: .regular))
                                .foregroundColor(change >= 0 ? AppTheme.accent : AppTheme.destructive)
                        }
                    }
                }
            }
        }
    }

    private func formatValue(_ value: Int) -> String {
        if value >= 1_000_000 { return String(format: "%.1fM", Double(value) / 1_000_000) }
        if value >= 1_000 { return String(format: "%.1fK", Double(value) / 1_000) }
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = ","
        formatter.usesGroupingSeparator = true
        return formatter.string(from: NSNumber(value: value)) ?? "\(value)"
    }

    private func formatDeadline(_ dateStr: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.timeZone = TimeZone.current
        guard let date = formatter.date(from: String(dateStr.prefix(10))) else { return dateStr }
        formatter.dateFormat = "MMM d, yyyy"
        return formatter.string(from: date)
    }
}

// MARK: - Edit directive sheet
struct EditDirectiveSheet: View {
    @State var directive: String
    let onSave: (String) -> Void
    let onCancel: () -> Void

    var body: some View {
        NavigationView {
            ZStack {
                AppTheme.background.ignoresSafeArea()
                VStack(alignment: .leading, spacing: AppTheme.spacingStack) {
                    SectionLabel(text: "Vision")
                    TextField("e.g. Dominate K-12 financial literacy", text: $directive)
                        .font(AppTheme.body())
                        .foregroundColor(AppTheme.textPrimary)
                        .padding(AppTheme.paddingCard)
                        .background(AppTheme.surfaceElevated)
                        .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.border, lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
                        .autocapitalization(.sentences)
                    Spacer()
                }
                .padding(AppTheme.paddingScreen)
            }
            .navigationTitle("Vision")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { onCancel() }
                        .font(AppTheme.body())
                        .foregroundColor(AppTheme.textSecondary)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { onSave(directive.trimmingCharacters(in: .whitespaces)) }
                        .font(AppTheme.headline(.semibold))
                        .foregroundColor(AppTheme.accent)
                }
            }
        }
    }
}

// MARK: - Edit metrics sheet (add + edit all metrics)
struct EditMetricsSheet: View {
    @EnvironmentObject var store: DashboardStore
    let dashboard: PersonalDashboard
    let onDismiss: () -> Void

    @State private var metrics: [DashboardMetric] = []
    @State private var newMetricLabel = ""
    @State private var newMetricCurrent = ""
    @State private var newMetricTarget = ""
    @State private var newMetricPrevious = ""
    @State private var newMetricDeadline = ""
    @State private var newMetricUnit = ""
    @State private var newMetricCode = ""
    @State private var showAddForm = false

    var body: some View {
        NavigationView {
            ZStack {
                AppTheme.background.ignoresSafeArea()
                ScrollView(.vertical, showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 20) {
                        ForEach(metrics) { m in
                            EditMetricRow(metric: m) { updated in
                                if let idx = metrics.firstIndex(where: { $0.id == updated.id }) {
                                    metrics[idx] = updated
                                    persistMetrics()
                                }
                            } onDelete: {
                                metrics.removeAll { $0.id == m.id }
                                persistMetrics()
                            }
                        }
        if showAddForm {
            addMetricForm
        }
        Button {
            if showAddForm {
                commitNewMetric()
            } else {
                showAddForm = true
                newMetricDeadline = endOfCurrentQuarter()
            }
        } label: {
            HStack(spacing: 10) {
                Image(systemName: showAddForm ? "checkmark.circle.fill" : "plus.circle.fill")
                    .font(.system(size: 17, weight: .semibold))
                Text("Add metric")
                    .font(AppTheme.headline(.medium))
            }
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .foregroundColor(.black)
            .background(AppTheme.accent)
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusButton))
        }
        .buttonStyle(PremiumButtonStyle())
                    }
                    .padding(AppTheme.paddingScreen)
                }
            }
            .navigationTitle("Metrics")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { onDismiss() }
                        .font(AppTheme.headline(.semibold))
                        .foregroundColor(AppTheme.accent)
                }
            }
            .onAppear {
                metrics = dashboard.metrics
            }
        }
    }

    private var addMetricForm: some View {
        VStack(alignment: .leading, spacing: AppTheme.spacingStack) {
            SectionLabel(text: "New metric")
            labeledField("Label", text: $newMetricLabel, placeholder: "e.g. Schools Live")
            labeledField("Code (optional)", text: $newMetricCode, placeholder: "e.g. PLT-01")
            HStack(spacing: 12) {
                labeledField("Current", text: $newMetricCurrent, placeholder: "0")
                labeledField("Target", text: $newMetricTarget, placeholder: "100")
            }
            HStack(spacing: 12) {
                labeledField("Previous", text: $newMetricPrevious, placeholder: "0")
                labeledField("Unit (optional)", text: $newMetricUnit, placeholder: "$M, K, M")
            }
            labeledField("Deadline (YYYY-MM-DD)", text: $newMetricDeadline, placeholder: "2026-12-01")
        }
        .padding(AppTheme.paddingCard)
        .background(AppTheme.surfaceOverlay)
        .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusCard).stroke(AppTheme.border, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusCard))
    }

    private func labeledField(_ label: String, text: Binding<String>, placeholder: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(AppTheme.caption1())
                .foregroundColor(AppTheme.textTertiary)
            TextField(placeholder, text: text)
                .font(AppTheme.body())
                .foregroundColor(AppTheme.textPrimary)
                .padding(14)
                .background(AppTheme.surfaceElevated)
                .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.border, lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
                .keyboardType(label.contains("Current") || label.contains("Target") || label.contains("Previous") ? .numberPad : .default)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func commitNewMetric() {
        let label = newMetricLabel.trimmingCharacters(in: .whitespaces)
        guard !label.isEmpty else { return }
        let current = Int(newMetricCurrent) ?? 0
        let target = Int(newMetricTarget) ?? 0
        let previous = Int(newMetricPrevious) ?? 0
        var deadline = newMetricDeadline.trimmingCharacters(in: .whitespaces)
        if deadline.isEmpty {
            let f = DateFormatter()
            f.dateFormat = "yyyy-MM-dd"
            deadline = f.string(from: Date())
        }
        let id = "m-\(Int(Date().timeIntervalSince1970 * 1000))"
        let code = newMetricCode.trimmingCharacters(in: .whitespaces)
        let newM = DashboardMetric(
            id: id,
            label: label,
            current: current,
            target: target,
            previous: previous,
            deadline: deadline,
            unit: newMetricUnit.isEmpty ? nil : newMetricUnit,
            code: code.isEmpty ? nil : code
        )
        metrics.append(newM)
        persistMetrics()
        Haptic.success()
        newMetricLabel = ""
        newMetricCode = ""
        newMetricCurrent = ""
        newMetricTarget = ""
        newMetricPrevious = ""
        newMetricUnit = ""
        newMetricDeadline = ""
        showAddForm = false
    }

    private func persistMetrics() {
        store.updateDashboard { $0.metrics = metrics }
    }

    private func endOfCurrentQuarter() -> String {
        let cal = Calendar.current
        let now = Date()
        var comps = cal.dateComponents([.year, .month], from: now)
        let month = comps.month ?? 1
        let quarterMonth = ((month - 1) / 3) * 3 + 3
        comps.month = quarterMonth
        comps.day = cal.range(of: .day, in: .month, for: cal.date(from: comps) ?? now)?.count ?? 30
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: cal.date(from: comps) ?? now)
    }
}

// MARK: - Single metric edit row
struct EditMetricRow: View {
    let metric: DashboardMetric
    let onUpdate: (DashboardMetric) -> Void
    let onDelete: () -> Void

    @State private var label: String = ""
    @State private var code: String = ""
    @State private var current: String = ""
    @State private var target: String = ""
    @State private var previous: String = ""
    @State private var deadline: String = ""
    @State private var unit: String = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(metric.label)
                    .font(AppTheme.subheadline(.semibold))
                    .foregroundColor(AppTheme.textPrimary)
                Spacer()
                Button {
                    onDelete()
                } label: {
                    Image(systemName: "trash")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(AppTheme.destructive)
                        .frame(width: AppTheme.minTouchTarget, height: AppTheme.minTouchTarget)
                }
                .buttonStyle(PremiumButtonStyle())
            }
            HStack(spacing: 12) {
                field("Label", $label)
                field("Code", $code)
            }
            HStack(spacing: 12) {
                field("Current", $current)
                field("Target", $target)
                field("Previous", $previous)
            }
            HStack(spacing: 12) {
                field("Deadline", $deadline)
                field("Unit", $unit)
            }
        }
        .padding(AppTheme.paddingCard)
        .background(AppTheme.surfaceOverlay)
        .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.border, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
        .onAppear {
            label = metric.label
            code = metric.code ?? ""
            current = "\(metric.current)"
            target = "\(metric.target)"
            previous = "\(metric.previous)"
            deadline = metric.deadline
            unit = metric.unit ?? ""
        }
        .onChange(of: label) { _ in apply() }
        .onChange(of: code) { _ in apply() }
        .onChange(of: current) { _ in apply() }
        .onChange(of: target) { _ in apply() }
        .onChange(of: previous) { _ in apply() }
        .onChange(of: deadline) { _ in apply() }
        .onChange(of: unit) { _ in apply() }
    }

    private func field(_ title: String, _ binding: Binding<String>) -> some View {
        let isNumeric = title == "Current" || title == "Target" || title == "Previous"
        return VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(AppTheme.caption2())
                .foregroundColor(AppTheme.textTertiary)
            TextField("", text: binding)
                .font(isNumeric ? AppTheme.monoData(size: 16, weight: .regular) : AppTheme.subheadline())
                .foregroundColor(AppTheme.textPrimary)
                .padding(12)
                .background(AppTheme.surfaceElevated)
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(AppTheme.border, lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .keyboardType(isNumeric ? .numberPad : .default)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func apply() {
        let c = Int(current) ?? 0
        let t = Int(target) ?? 0
        let p = Int(previous) ?? 0
        var updated = metric
        updated.label = label.trimmingCharacters(in: .whitespaces).isEmpty ? metric.label : label
        updated.code = code.trimmingCharacters(in: .whitespaces).isEmpty ? nil : code
        updated.current = c
        updated.target = t
        updated.previous = p
        updated.deadline = deadline.isEmpty ? metric.deadline : deadline
        updated.unit = unit.isEmpty ? nil : unit
        onUpdate(updated)
    }
}
