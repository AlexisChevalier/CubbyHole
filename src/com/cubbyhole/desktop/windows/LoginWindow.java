package com.cubbyhole.desktop.windows;

import java.awt.EventQueue;
import java.awt.Font;
import java.awt.Toolkit;

import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.SwingConstants;

public class LoginWindow {

	private JFrame	frmCubbyholeDesktopApplication;

	/**
	 * Launch the application.
	 */
	public static void main(String[] args) {
		EventQueue.invokeLater(new Runnable() {
			@Override
			public void run() {
				try {
					LoginWindow window = new LoginWindow();
					window.frmCubbyholeDesktopApplication.setVisible(true);
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		});
	}

	/**
	 * Create the application.
	 */
	public LoginWindow() {
		initialize();
	}

	/**
	 * Initialize the contents of the frame.
	 */
	private void initialize() {
		frmCubbyholeDesktopApplication = new JFrame();
		frmCubbyholeDesktopApplication.setTitle("CubbyHole Desktop Application");
		frmCubbyholeDesktopApplication.setResizable(false);
		frmCubbyholeDesktopApplication.setIconImage(Toolkit.getDefaultToolkit().getImage(
				LoginWindow.class.getResource("/resources/icon.png")));
		frmCubbyholeDesktopApplication.setBounds(100, 100, 450, 300);
		frmCubbyholeDesktopApplication.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frmCubbyholeDesktopApplication.getContentPane().setLayout(null);

		JLabel lblYouAreNot = new JLabel("You are not logged in yet");
		lblYouAreNot.setHorizontalAlignment(SwingConstants.CENTER);
		lblYouAreNot.setFont(new Font("Tahoma", Font.PLAIN, 22));
		lblYouAreNot.setBounds(10, 11, 424, 47);
		frmCubbyholeDesktopApplication.getContentPane().add(lblYouAreNot);

		JButton btnLogin = new JButton("Login");
		btnLogin.setFont(new Font("Tahoma", Font.PLAIN, 16));
		btnLogin.setBounds(163, 119, 108, 47);
		frmCubbyholeDesktopApplication.getContentPane().add(btnLogin);
	}
}
