import UIKit
import SwiftUI

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    private let store = DashboardStore()

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        window = UIWindow(frame: UIScreen.main.bounds)
        let root = UIHostingController(rootView: ContentView().environmentObject(store))
        window?.rootViewController = root
        window?.makeKeyAndVisible()
        return true
    }
}
