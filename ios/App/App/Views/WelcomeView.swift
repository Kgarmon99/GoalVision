import SwiftUI

struct WelcomeView: View {
    @EnvironmentObject var store: DashboardStore
    @State private var name = ""
    @State private var creating = false

    var body: some View {
        MatrixScreen {
            VStack(spacing: 0) {
                Spacer().frame(height: 56)
                Image(systemName: "target")
                    .font(.system(size: 52, weight: .light))
                    .foregroundColor(AppTheme.accent)

                Text("GoalVision")
                    .font(AppTheme.largeTitle())
                    .foregroundColor(AppTheme.textPrimary)
                    .padding(.top, 24)

                Text("Track goals. Ship the roadmap.")
                    .font(AppTheme.body())
                    .foregroundColor(AppTheme.textSecondary)
                    .padding(.top, 8)

                VStack(alignment: .leading, spacing: 10) {
                    SectionLabel(text: "Dashboard name")
                    TextField("My Dashboard", text: $name)
                        .font(AppTheme.body())
                        .foregroundColor(AppTheme.textPrimary)
                        .padding(18)
                        .background(AppTheme.surface)
                        .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput).stroke(AppTheme.border, lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusInput))
                        .autocapitalization(.words)
                }
                .padding(AppTheme.paddingScreen)
                .padding(.top, 48)

                VStack(spacing: 14) {
                    MatrixPrimaryButton("Start with template", icon: "square.stack.3d.up.fill") {
                        let d = PersonalDashboard.createFromTemplate(name: name.trimmingCharacters(in: .whitespaces))
                        store.setDashboard(d)
                        creating = true
                    }
                    .disabled(creating)

                    MatrixSecondaryButton("Start from scratch", icon: "doc") {
                        let d = PersonalDashboard.createEmpty(name: name.trimmingCharacters(in: .whitespaces))
                        store.setDashboard(d)
                        creating = true
                    }
                    .disabled(creating)
                }
                .padding(.horizontal, AppTheme.paddingScreen)
                .padding(.top, 16)

                Spacer()
            }
        }
    }
}
