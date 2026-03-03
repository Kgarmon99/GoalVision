import SwiftUI
import UIKit

// MARK: - Haptic feedback
enum Haptic {
    static func light() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }
    static func medium() {
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }
    static func success() {
        UINotificationFeedbackGenerator().notificationOccurred(.success)
    }
}

// MARK: - Premium design system (Jony Ive–inspired)
enum AppTheme {
    // Surfaces
    static let background = Color(white: 0)
    static let surface = Color(white: 0.055)
    static let surfaceElevated = Color(white: 0.08)
    static let surfaceOverlay = Color(white: 0.065)

    // Text hierarchy
    static let textPrimary = Color(white: 0.95)
    static let textSecondary = Color(white: 0.55)
    static let textTertiary = Color(white: 0.38)
    static let textQuaternary = Color(white: 0.28)

    // Accent — refined green (restraint)
    static let accent = Color(red: 0.2, green: 0.78, blue: 0.35)
    static let accentDim = Color(red: 0.2, green: 0.78, blue: 0.35).opacity(0.7)
    static let accentSubtle = Color(red: 0.2, green: 0.78, blue: 0.35).opacity(0.15)

    // Semantic
    static let success = Color(red: 0.2, green: 0.78, blue: 0.35)
    static let destructive = Color(red: 1, green: 0.27, blue: 0.27)

    // Border
    static let border = Color.white.opacity(0.06)
    static let borderStrong = Color.white.opacity(0.1)

    // Typography — SF Pro sensibility
    static func largeTitle(_ weight: Font.Weight = .bold) -> Font { .system(size: 34, weight: weight) }
    static func title(_ weight: Font.Weight = .bold) -> Font { .system(size: 28, weight: weight) }
    static func title2(_ weight: Font.Weight = .semibold) -> Font { .system(size: 22, weight: weight) }
    static func title3(_ weight: Font.Weight = .semibold) -> Font { .system(size: 20, weight: weight) }
    static func headline(_ weight: Font.Weight = .semibold) -> Font { .system(size: 17, weight: weight) }
    static func body(_ weight: Font.Weight = .regular) -> Font { .system(size: 17, weight: weight) }
    static func callout(_ weight: Font.Weight = .regular) -> Font { .system(size: 16, weight: weight) }
    static func subheadline(_ weight: Font.Weight = .regular) -> Font { .system(size: 15, weight: weight) }
    static func footnote(_ weight: Font.Weight = .regular) -> Font { .system(size: 13, weight: weight) }
    static func caption1(_ weight: Font.Weight = .regular) -> Font { .system(size: 12, weight: weight) }
    static func caption2(_ weight: Font.Weight = .regular) -> Font { .system(size: 11, weight: weight) }
    static func tab(_ weight: Font.Weight = .medium) -> Font { .system(size: 10, weight: weight) }

    // Monospace only for data (numbers, codes)
    static func monoData(size: CGFloat = 17, weight: Font.Weight = .medium) -> Font {
        .system(size: size, weight: weight, design: .monospaced)
    }

    // Layout
    static let cornerRadiusCard: CGFloat = 16
    static let cornerRadiusButton: CGFloat = 14
    static let cornerRadiusInput: CGFloat = 12
    static let cornerRadiusPill: CGFloat = 10
    static let paddingScreen: CGFloat = 20
    static let paddingCard: CGFloat = 16
    static let spacingSection: CGFloat = 24
    static let spacingStack: CGFloat = 12
    static let spacingTight: CGFloat = 6
    static let minTouchTarget: CGFloat = 44
    /// Grid unit for alignment; grid lines repeat every this many points (matches padding rhythm)
    static let gridUnit: CGFloat = 20

    // Motion
    static let spring: Animation = .spring(response: 0.4, dampingFraction: 0.82)
    static let springSnappy: Animation = .spring(response: 0.35, dampingFraction: 0.78)
    static let springSlow: Animation = .spring(response: 0.5, dampingFraction: 0.85)

    // Glow / aura (retro-futuristic, subtle)
    static let glowColor = Color(red: 0.2, green: 0.78, blue: 0.35)
    static let glowRadius: CGFloat = 12
    static let glowRadiusStrong: CGFloat = 20
    static let glowOpacity: Double = 0.35
    static let glowOpacityStrong: Double = 0.5
}

// Backwards compatibility
enum MatrixTheme {
    static var matrixGreen: Color { AppTheme.accent }
    static var black: Color { AppTheme.background }
    static var terminalGray: Color { AppTheme.surface }
    static var terminalText: Color { AppTheme.textPrimary }
    static var terminalMuted: Color { AppTheme.textSecondary }
    static func mono(size: CGFloat, weight: Font.Weight = .regular) -> Font { AppTheme.monoData(size: size, weight: weight) }
}

// MARK: - Premium button style (subtle scale + opacity)
struct PremiumButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .opacity(configuration.isPressed ? 0.92 : 1)
            .animation(AppTheme.spring, value: configuration.isPressed)
    }
}

struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .opacity(configuration.isPressed ? 0.92 : 1)
            .animation(AppTheme.spring, value: configuration.isPressed)
    }
}

// MARK: - Premium card (depth, restraint)
struct PremiumCard<Content: View>: View {
    @ViewBuilder var content: () -> Content
    var body: some View {
        content()
            .padding(AppTheme.paddingCard)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(AppTheme.surface)
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.cornerRadiusCard)
                    .stroke(AppTheme.border, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusCard))
            .shadow(color: .black.opacity(0.35), radius: 16, x: 0, y: 4)
    }
}

struct SimpleCard<Content: View>: View {
    @ViewBuilder var content: () -> Content
    var glow: Bool = false
    var body: some View {
        content()
            .padding(AppTheme.paddingCard)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(AppTheme.surface)
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.cornerRadiusCard)
                    .stroke(glow ? AppTheme.glowColor.opacity(0.25) : AppTheme.border, lineWidth: glow ? 1.5 : 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusCard))
            .shadow(color: .black.opacity(0.3), radius: 12, x: 0, y: 4)
            .shadow(color: glow ? AppTheme.glowColor.opacity(0.2) : .clear, radius: 16, x: 0, y: 0)
    }
}

// MARK: - Primary button (filled, premium)
struct MatrixPrimaryButton: View {
    let title: String
    let icon: String?
    let action: () -> Void

    init(_ title: String, icon: String? = nil, action: @escaping () -> Void) {
        self.title = title
        self.icon = icon
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: 10) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 17, weight: .semibold))
                }
                Text(title)
                    .font(AppTheme.headline(.semibold))
            }
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(AppTheme.accent)
            .foregroundColor(.black)
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadiusButton))
            .glowAccent(radius: 14, opacity: 0.3)
        }
        .buttonStyle(PremiumButtonStyle())
    }
}

// MARK: - Secondary button (outline)
struct MatrixSecondaryButton: View {
    let title: String
    let icon: String?
    let action: () -> Void

    init(_ title: String, icon: String? = nil, action: @escaping () -> Void) {
        self.title = title
        self.icon = icon
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: 10) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 16, weight: .medium))
                }
                Text(title)
                    .font(AppTheme.headline(.medium))
            }
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.cornerRadiusButton)
                    .stroke(AppTheme.borderStrong, lineWidth: 1)
            )
            .foregroundColor(AppTheme.textPrimary)
        }
        .buttonStyle(PremiumButtonStyle())
    }
}

// MARK: - Grid lines overlay (harmony, alignment)
struct GridLinesOverlay: View {
    var gridUnit: CGFloat = AppTheme.gridUnit
    var lineColor: Color = Color.white.opacity(0.045)
    var body: some View {
        GeometryReader { g in
            let w = g.size.width
            let h = g.size.height
            let cols = Int(w / gridUnit) + 2
            let rows = Int(h / gridUnit) + 2
            ZStack(alignment: .topLeading) {
                ForEach(0..<cols, id: \.self) { i in
                    Path { p in
                        let x = CGFloat(i) * gridUnit
                        p.move(to: CGPoint(x: x, y: 0))
                        p.addLine(to: CGPoint(x: x, y: h))
                    }
                    .stroke(lineColor, lineWidth: 0.5)
                }
                ForEach(0..<rows, id: \.self) { i in
                    Path { p in
                        let y = CGFloat(i) * gridUnit
                        p.move(to: CGPoint(x: 0, y: y))
                        p.addLine(to: CGPoint(x: w, y: y))
                    }
                    .stroke(lineColor, lineWidth: 0.5)
                }
            }
        }
        .allowsHitTesting(false)
    }
}

// MARK: - Full-screen container (grid + subtle retro scan)
struct MatrixScreen<Content: View>: View {
    @ViewBuilder var content: () -> Content
    var body: some View {
        ZStack {
            AppTheme.background.ignoresSafeArea()
            GridLinesOverlay()
            content()
            SubtleScanOverlay()
        }
    }
}

// MARK: - Section label (uppercase, tracked)
struct SectionLabel: View {
    let text: String
    var body: some View {
        Text(text.uppercased())
            .font(AppTheme.caption1(.medium))
            .foregroundColor(AppTheme.textTertiary)
            .tracking(0.6)
    }
}

// MARK: - Glow modifiers (aura, retro-futuristic)
struct GlowModifier: ViewModifier {
    var color: Color = AppTheme.glowColor
    var radius: CGFloat = AppTheme.glowRadius
    var opacity: Double = AppTheme.glowOpacity
    func body(content: Content) -> some View {
        content
            .shadow(color: color.opacity(opacity), radius: radius, x: 0, y: 0)
            .shadow(color: color.opacity(opacity * 0.6), radius: radius * 0.6, x: 0, y: 0)
    }
}
struct GlowBorderModifier: ViewModifier {
    var color: Color = AppTheme.glowColor
    var opacity: Double = 0.2
    var cornerRadius: CGFloat = AppTheme.cornerRadiusCard
    func body(content: Content) -> some View {
        content
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .stroke(color.opacity(opacity), lineWidth: 1)
            )
            .shadow(color: color.opacity(opacity * 0.8), radius: 8, x: 0, y: 0)
    }
}
extension View {
    func glowAccent(radius: CGFloat = AppTheme.glowRadius, opacity: Double = AppTheme.glowOpacity) -> some View {
        modifier(GlowModifier(color: AppTheme.glowColor, radius: radius, opacity: opacity))
    }
    func glowAura(strong: Bool = false) -> some View {
        modifier(GlowModifier(
            color: AppTheme.glowColor,
            radius: strong ? AppTheme.glowRadiusStrong : AppTheme.glowRadius,
            opacity: strong ? AppTheme.glowOpacityStrong : AppTheme.glowOpacity * 0.7
        ))
    }
    func glowBorder(cornerRadius: CGFloat = AppTheme.cornerRadiusCard) -> some View {
        modifier(GlowBorderModifier(cornerRadius: cornerRadius))
    }
}

// MARK: - Animated progress bar with subtle glow
struct PremiumProgressBar: View {
    let progress: Double
    var height: CGFloat = 6
    var glow: Bool = true
    var body: some View {
        GeometryReader { g in
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: height / 2)
                    .fill(AppTheme.surfaceElevated)
                    .frame(height: height)
                RoundedRectangle(cornerRadius: height / 2)
                    .fill(AppTheme.accent)
                    .frame(width: max(0, g.size.width * min(1, max(0, progress)) / 100), height: height)
                    .animation(AppTheme.springSlow, value: progress)
                    .shadow(color: AppTheme.glowColor.opacity(glow ? 0.4 : 0), radius: 4, x: 0, y: 0)
            }
        }
        .frame(height: height)
    }
}

// MARK: - Subtle scan overlay (retro-futuristic)
struct SubtleScanOverlay: View {
    var body: some View {
        GeometryReader { g in
            LinearGradient(
                colors: [
                    Color.clear,
                    Color.white.opacity(0.015),
                    Color.clear
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .frame(height: g.size.height)
        }
        .allowsHitTesting(false)
    }
}
