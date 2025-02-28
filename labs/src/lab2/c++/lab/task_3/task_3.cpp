#include <windows.h>
#include <commdlg.h>
#include <gdiplus.h>
#include <vector>
#include <string>
#include <algorithm>

#pragma comment(lib, "gdiplus.lib")

using namespace Gdiplus;

// Глобальные переменные
HWND hWnd;
std::vector<std::wstring> g_openElements = { L"Земля", L"Огонь", L"Вода", L"Воздух" };
std::vector<std::wstring> g_experimentElements;
std::vector<Bitmap*> g_elementIcons;
Bitmap* g_deleteIcon = nullptr;
int g_selectedElement = -1;
int g_dragElement = -1;
int g_deleteZoneX = 700;
int g_deleteZoneY = 500;
int g_deleteZoneSize = 50;
const int ICON_WIDTH = 50;  // Фиксированная ширина иконки
const int ICON_HEIGHT = 50; // Фиксированная высота иконки
POINT g_dragStartPoint = { -1, -1 }; // Начальная точка перетаскивания

// Прототипы функций
LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);
void OnPaint(HWND hwnd);
void LoadIcons();
void DrawElements(HDC hdc);
void DrawExperimentElements(HDC hdc);
void DrawDeleteZone(HDC hdc);
void CombineElements(const std::wstring& element1, const std::wstring& element2);
void SortElements();
void ShowMessage(const std::wstring& message);

int APIENTRY wWinMain(_In_ HINSTANCE hInstance, _In_opt_ HINSTANCE hPrevInstance, _In_ LPWSTR lpCmdLine, _In_ int nCmdShow) {
    GdiplusStartupInput gdiplusStartupInput;
    ULONG_PTR gdiplusToken;
    GdiplusStartup(&gdiplusToken, &gdiplusStartupInput, nullptr);

    WNDCLASSEX wcex = { sizeof(WNDCLASSEX) };
    wcex.style = CS_HREDRAW | CS_VREDRAW;
    wcex.lpfnWndProc = WndProc;
    wcex.hInstance = hInstance;
    wcex.hCursor = LoadCursor(nullptr, IDC_ARROW);
    wcex.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    wcex.lpszClassName = L"AlchemyGame";
    RegisterClassEx(&wcex);

    hWnd = CreateWindow(wcex.lpszClassName, L"Алхимия", WS_OVERLAPPEDWINDOW,
        CW_USEDEFAULT, CW_USEDEFAULT, 800, 600, nullptr, nullptr, hInstance, nullptr);

    LoadIcons();

    ShowWindow(hWnd, nCmdShow);
    UpdateWindow(hWnd);

    MSG msg;
    while (GetMessage(&msg, nullptr, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    GdiplusShutdown(gdiplusToken);
    return (int)msg.wParam;
}

LRESULT CALLBACK WndProc(HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam) {
    switch (message) {
    case WM_LBUTTONDOWN: {
        int x = LOWORD(lParam);
        int y = HIWORD(lParam);

        // Проверка, выбран ли элемент из списка открытых элементов
        if (x < 400 && y < 500) {
            int index = y / ICON_HEIGHT;
            if (index < g_openElements.size()) {
                g_dragElement = index;
                g_dragStartPoint = { x, y };
                SetCapture(hwnd); // Захватываем мышь
            }
        }

        // Проверка, выбран ли элемент на поле для экспериментов
        if (x >= 400 && x < 800 && y < 500) {
            int index = (x - 400) / ICON_WIDTH;
            if (index < g_experimentElements.size()) {
                g_selectedElement = index;
            }
        }
        break;
    }
    case WM_MOUSEMOVE: {
        if (g_dragElement != -1) {
            // Перерисовываем окно, чтобы обновить позицию перетаскиваемого элемента
            InvalidateRect(hwnd, nullptr, TRUE);
        }
        break;
    }
    case WM_LBUTTONUP: {
        int x = LOWORD(lParam);
        int y = HIWORD(lParam);

        if (g_dragElement != -1) {
            // Перенос элемента на поле для экспериментов
            if (x >= 400 && x < 800 && y < 500) {
                g_experimentElements.push_back(g_openElements[g_dragElement]);
            }
            g_dragElement = -1;
            g_dragStartPoint = { -1, -1 };
            ReleaseCapture(); // Освобождаем мышь
        }

        if (g_selectedElement != -1) {
            // Удаление элемента с поля для экспериментов
            if (x >= g_deleteZoneX && x <= g_deleteZoneX + g_deleteZoneSize &&
                y >= g_deleteZoneY && y <= g_deleteZoneY + g_deleteZoneSize) {
                g_experimentElements.erase(g_experimentElements.begin() + g_selectedElement);
            }
            g_selectedElement = -1;
        }

        // Проверка комбинации элементов
        if (g_experimentElements.size() == 2) {
            CombineElements(g_experimentElements[0], g_experimentElements[1]);
            g_experimentElements.clear();
        }

        InvalidateRect(hwnd, nullptr, TRUE);
        break;
    }
    case WM_PAINT: {
        OnPaint(hwnd);
        break;
    }
    case WM_COMMAND: {
        if (LOWORD(wParam) == 1) { // Сортировка элементов
            SortElements();
            InvalidateRect(hwnd, nullptr, TRUE);
        }
        break;
    }
    case WM_DESTROY: {
        PostQuitMessage(0);
        break;
    }
    default:
        return DefWindowProc(hwnd, message, wParam, lParam);
    }
    return 0;
}

void OnPaint(HWND hwnd) {
    PAINTSTRUCT ps;
    HDC hdc = BeginPaint(hwnd, &ps);

    DrawElements(hdc);
    DrawExperimentElements(hdc);
    DrawDeleteZone(hdc);

    // Рисуем перетаскиваемый элемент, если он есть
    if (g_dragElement != -1) {
        Graphics graphics(hdc);
        POINT pt;
        GetCursorPos(&pt);
        ScreenToClient(hwnd, &pt);

        if (g_dragElement < g_elementIcons.size()) {
            graphics.DrawImage(g_elementIcons[g_dragElement], pt.x - ICON_WIDTH / 2, pt.y - ICON_HEIGHT / 2, ICON_WIDTH, ICON_HEIGHT);
        }
    }

    EndPaint(hwnd, &ps);
}

void LoadIcons() {
    g_elementIcons.push_back(new Bitmap(L"earth.jpg"));
    g_elementIcons.push_back(new Bitmap(L"fire.jpg"));
    g_elementIcons.push_back(new Bitmap(L"water.jpg"));
    g_elementIcons.push_back(new Bitmap(L"air.jpg"));
    g_deleteIcon = new Bitmap(L"delete.jpg");
}

void DrawElements(HDC hdc) {
    Graphics graphics(hdc);
    for (size_t i = 0; i < g_openElements.size(); i++) {
        if (i < g_elementIcons.size()) {
            // Масштабируем иконку до фиксированных размеров
            graphics.DrawImage(g_elementIcons[i], 10, 10 + i * ICON_HEIGHT, ICON_WIDTH, ICON_HEIGHT);
        }
        TextOut(hdc, 70, 20 + i * ICON_HEIGHT, g_openElements[i].c_str(), g_openElements[i].length());
    }
}

void DrawExperimentElements(HDC hdc) {
    Graphics graphics(hdc);
    for (size_t i = 0; i < g_experimentElements.size(); i++) {
        auto it = std::find(g_openElements.begin(), g_openElements.end(), g_experimentElements[i]);
        if (it != g_openElements.end()) {
            int index = std::distance(g_openElements.begin(), it);
            // Масштабируем иконку до фиксированных размеров
            graphics.DrawImage(g_elementIcons[index], 410 + i * ICON_WIDTH, 10, ICON_WIDTH, ICON_HEIGHT);
        }
    }
}

void DrawDeleteZone(HDC hdc) {
    Graphics graphics(hdc);
    if (g_deleteIcon) {
        // Масштабируем иконку удаления до фиксированных размеров
        graphics.DrawImage(g_deleteIcon, g_deleteZoneX, g_deleteZoneY, ICON_WIDTH, ICON_HEIGHT);
    }
}

void CombineElements(const std::wstring& element1, const std::wstring& element2) {
    std::wstring result;

    if ((element1 == L"Огонь" && element2 == L"Вода") || (element1 == L"Вода" && element2 == L"Огонь")) {
        result = L"Пар";
    }
    else if ((element1 == L"Огонь" && element2 == L"Земля") || (element1 == L"Земля" && element2 == L"Огонь")) {
        result = L"Лава";
    }
    else if ((element1 == L"Воздух" && element2 == L"Земля") || (element1 == L"Земля" && element2 == L"Воздух")) {
        result = L"Пыль";
    }
    // Добавьте другие комбинации здесь...

    if (!result.empty()) {
        g_openElements.push_back(result);
        ShowMessage(L"Создан новый элемент: " + result);
    }
    else {
        ShowMessage(L"Ничего не произошло.");
    }
}

void SortElements() {
    std::sort(g_openElements.begin(), g_openElements.end());
}

void ShowMessage(const std::wstring& message) {
    HDC hdc = GetDC(hWnd);
    TextOut(hdc, 10, 550, message.c_str(), message.length());
    ReleaseDC(hWnd, hdc);
}