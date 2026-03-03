import SwiftUI

struct SchoolsView: View {
    var body: some View {
        MatrixScreen {
            VStack(spacing: 20) {
                Spacer().frame(height: 100)
                Image(systemName: "building.2")
                    .font(.system(size: 48, weight: .light))
                    .foregroundColor(AppTheme.accent)
                Text("Schools")
                    .font(AppTheme.title2())
                    .foregroundColor(AppTheme.textPrimary)
                Text("Connect your API or add school data here.")
                    .font(AppTheme.body())
                    .foregroundColor(AppTheme.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
                Spacer()
            }
        }
    }
}
