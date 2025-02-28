#ifndef IMAGEAPP_H
#define IMAGEAPP_H

#include <commdlg.h>
#include <gdiplus.h>
#include <windows.h>
#include <string>

#pragma comment(lib, "gdiplus.lib")

class ImageApp {
 public:
  ImageApp(HINSTANCE hInstance);
  ~ImageApp();
  void Run();

 private:
  HWND hWnd;
  Gdiplus::Bitmap* pBitmap;
  int imageOffsetX;
  int imageOffsetY;
  bool isDragging;
  POINT dragStart;
  Gdiplus::Bitmap* pBackBuffer;

  static LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);
  void OnPaint(HWND hwnd);
  void LoadImage(HWND hwnd, const std::wstring& filePath);
  void CenterImage(HWND hwnd);
  void DrawChessboard(Gdiplus::Graphics& graphics, int width, int height);
  void CreateBackBuffer(HWND hwnd);
};

#endif  // IMAGEAPP_H