import React, { useEffect, useRef, useState } from "react";

// 使用一个完全不依赖回调的方法
const App = () => {
  const mapContainer = useRef(null);
  const [mapError, setMapError] = useState(null);
  
  useEffect(() => {
    // 移除任何现有的Google Maps脚本
    const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
    existingScripts.forEach(script => script.remove());
    
    // 删除任何可能存在的全局回调
    if (window.initMap) {
      delete window.initMap;
    }
    
    // 创建地图加载指示器
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "map-loading";
    loadingDiv.style.position = "absolute";
    loadingDiv.style.top = "50%";
    loadingDiv.style.left = "50%";
    loadingDiv.style.transform = "translate(-50%, -50%)";
    loadingDiv.style.background = "rgba(255, 255, 255, 0.8)";
    loadingDiv.style.padding = "10px";
    loadingDiv.style.borderRadius = "4px";
    loadingDiv.textContent = "加载地图中...";
    document.body.appendChild(loadingDiv);
    
    // 首先加载Google Maps脚本，不使用回调
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBrKVRHuO8aystgilHTqp4KsUkiI9MzGP8";
    script.async = true;
    
    // 手动检查Google Maps是否加载，然后初始化地图
    const checkAndInitMap = () => {
      if (window.google && window.google.maps) {
        try {
          // 移除加载提示
          const loadingElement = document.getElementById("map-loading");
          if (loadingElement) {
            document.body.removeChild(loadingElement);
          }
          
          // 初始化地图
          if (!mapContainer.current) return;
          
          const mapOptions = {
            center: { lat: 40.12150192260742, lng: -100.45039367675781 },
            zoom: 4,
            mapTypeId: "roadmap"
          };
          
          const map = new window.google.maps.Map(mapContainer.current, mapOptions);
          
          // 添加标记
          new window.google.maps.Marker({
            position: mapOptions.center,
            map: map,
            title: "我的位置"
          });
          
          clearInterval(checkInterval);
        } catch (err) {
          console.error("地图初始化出错:", err);
          setMapError("地图初始化失败: " + err.message);
          clearInterval(checkInterval);
          
          // 移除加载提示
          const loadingElement = document.getElementById("map-loading");
          if (loadingElement) {
            document.body.removeChild(loadingElement);
          }
        }
      }
    };
    
    // 设置检查间隔，每100ms检查一次Google Maps是否加载完成
    const checkInterval = setInterval(checkAndInitMap, 100);
    
    // 添加脚本到页面
    document.head.appendChild(script);
    
    // 添加脚本加载错误处理
    script.onerror = () => {
      clearInterval(checkInterval);
      setMapError("加载Google Maps API失败，请检查网络连接和API密钥");
      
      // 移除加载提示
      const loadingElement = document.getElementById("map-loading");
      if (loadingElement) {
        document.body.removeChild(loadingElement);
      }
    };
    
    // 设置超时，如果30秒后地图仍未加载，显示错误
    const timeout = setTimeout(() => {
      if (!window.google || !window.google.maps) {
        clearInterval(checkInterval);
        setMapError("加载Google Maps超时，请刷新页面重试");
        
        // 移除加载提示
        const loadingElement = document.getElementById("map-loading");
        if (loadingElement) {
          document.body.removeChild(loadingElement);
        }
      }
    }, 30000);
    
    // 组件卸载时清理
    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
      
      // 移除加载提示
      const loadingElement = document.getElementById("map-loading");
      if (loadingElement) {
        document.body.removeChild(loadingElement);
      }
    };
  }, []);
  
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {mapError && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#ffeeee",
            color: "red",
            padding: "10px",
            borderRadius: "4px",
            zIndex: 100,
            maxWidth: "80%",
            textAlign: "center"
          }}
        >
          {mapError}
        </div>
      )}
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "100%",
          background: "#f0f0f0"
        }}
      />
    </div>
  );
};

export default App;