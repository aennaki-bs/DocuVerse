using System;

namespace DocManagementBackend.Utils
{
    public static class ConsoleColorHelper
    {
        public static void WriteInfo(string message)
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($"[INFO] {DateTime.Now:yyyy-MM-dd HH:mm:ss} - {message}");
            Console.ResetColor();
        }

        public static void WriteSuccess(string message)
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($"[SUCCESS] {DateTime.Now:yyyy-MM-dd HH:mm:ss} - {message}");
            Console.ResetColor();
        }

        public static void WriteError(string message)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"[ERROR] {DateTime.Now:yyyy-MM-dd HH:mm:ss} - {message}");
            Console.ResetColor();
        }

        public static void WriteWarning(string message)
        {
            Console.ForegroundColor = ConsoleColor.DarkYellow;
            Console.WriteLine($"[WARNING] {DateTime.Now:yyyy-MM-dd HH:mm:ss} - {message}");
            Console.ResetColor();
        }

        public static void WriteDebug(string message)
        {
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine($"[DEBUG] {DateTime.Now:yyyy-MM-dd HH:mm:ss} - {message}");
            Console.ResetColor();
        }

        public static void WriteException(string message, Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"[EXCEPTION] {DateTime.Now:yyyy-MM-dd HH:mm:ss} - {message}");
            Console.WriteLine($"[EXCEPTION] Type: {ex.GetType().Name}");
            Console.WriteLine($"[EXCEPTION] Message: {ex.Message}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"[EXCEPTION] Inner: {ex.InnerException.Message}");
            }
            Console.WriteLine($"[EXCEPTION] Stack: {ex.StackTrace}");
            Console.ResetColor();
        }
    }
} 