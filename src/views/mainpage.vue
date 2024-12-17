<template>
  <div ref="mapContainer" class="map-container"></div>

  <!-- 左边的图标和隐藏选择框 -->
  <img src="../assets/layers-2x.png" class="logoleft" @mouseenter="handleChangeLeft" />
  <div class="formDataLeft" v-if="isVisibleLeft.showDivLeft">
    <el-form :model="formDataLeft">
      <el-form-item>
        <el-radio-group v-model="formDataLeft.selectedOption" class="radio-group">
          <div style="margin-left: 20px; display: flex; align-items: center;">
            <el-select
                v-model="formDataLeft.singleSelectedYear"
                placeholder="请选择台风年份"
                style="width: 150px; font-weight: 700;"
                @change="changePic"
              >
                <el-option label="2010" value="2010"></el-option>
                <el-option label="2011" value="2011"></el-option>
                <el-option label="2012" value="2012"></el-option>
                <el-option label="2013" value="2013"></el-option>
                <el-option label="2014" value="2014"></el-option>
                <el-option label="2015" value="2015"></el-option>
                <el-option label="2016" value="2016"></el-option>
                <el-option label="2017" value="2017"></el-option>
                <el-option label="2018" value="2018"></el-option>
                <el-option label="2019" value="2019"></el-option>
            </el-select>
          </div>
          <div style="margin-left: 20px; display: flex; align-items: center;">
            <el-select
              v-model="formDataLeft.changeType"
              placeholder="全部数据"
              style="width: 150px; font-weight: 700;"
              @change="changePic"
            >
            <el-option label="全部数据" value="0"></el-option>
            <el-option label="平均数据" value="1"></el-option>
        </el-select>
        </div>
          <div style="margin-left: 20px; display: flex; align-items: center;">
              <el-select
              v-model="formDataLeft.typhoon"
              placeholder="请选择具体台风"
              style="width: 150px; font-weight: 700;"
              @change="handleYearLeft('first-select')"
            >
            <el-option
                v-for="typhoon in formDataLeft.typhoonOptions"
                :key="typhoon"
                :label="typhoon"
                :value="typhoon"
            ></el-option>
          </el-select>
          </div>
          <!-- 台风年份区间选择下拉框 -->
          <div style="margin-left: 20px; display: flex; align-items: center;">
            <el-select
                v-model="formDataLeft.selectedYear"
                placeholder="请选择年份区间"
                style="width: 150px; font-weight: 700;"
                @change="handleYearChangeLeft"
              >
              <el-option label="1980-1990" value="1980-1990"></el-option>
              <el-option label="1990-2000" value="1990-2000"></el-option>
              <el-option label="2000-2010" value="2000-2010"></el-option>
              <el-option label="2010-2020" value="2010-2020"></el-option>
            </el-select>
          </div>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </div>

   <!-- 弹窗内容 -->
    <!-- 单年份窗口 -->
  
  <div v-if="dialogVisibleYear" class="year-box" @click.stop>
    <div class="info-content">
       <!-- 标题 -->
      <h3 style="margin-bottom: 10px;">登录台风统计</h3>
      <!-- 折线图 -->
      <div id="typhoon-line-chart" style="width: 330px; height: 450px;"></div>
    </div>
  </div>

  <div v-if="dialogVisible" class="info-box" @click.stop>
    <div class="info-content">
       <!-- 标题 -->
      <h3 style="margin-bottom: 10px;">不同年份区间的各省份台风数量统计</h3>
      <!-- 柱状图 -->
        <div id="typhoon-bar-chart" style="width: 330px; height: 250px;"></div>
      <!-- 雷达图 -->
        <div id="typhoon-radar-chart" style="width: 330px; height: 300px; margin-top: 20px;"></div>
    </div>
  </div>


  <img src="../assets/layers-2x.png" class="logo"  @mouseenter="handleChange">

  <div class='formData' v-if="isVisible.showDiv1" @mouseleave="handleLeaf">
    <el-form :model="formData">
      <el-form-item>
        <el-radio-group v-model="formData.selectedOption" class="radio-group">
          <el-radio label="wind" style="margin-left: 30px; font-weight: 700;" >风场图层</el-radio>
          <el-radio label="heat" style="font-weight: 700;">热力图层</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </div>


</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref, onUnmounted, watch, nextTick} from 'vue';
import type { UnwrapNestedRefs } from 'vue';
import L from 'leaflet'; // 导入Leaflet库，用于地图功能
import 'leaflet/dist/leaflet.css'; // Leaflet样式
import { useQLeafletStore } from '../util/leafeltStore'; // 引入自定义仓库
import { TianDiTu } from '../util/tiandituConstants'; // 引入天地图常量
import '../components/leaflet-velocity/leaflet-velocity.css';
import '../components/leaflet-velocity/leaflet-velocity';
import windJson from '../json/wind-global.json'; // 风场数据
// @ts-ignore
import dataJson from '../json/data.json';  // 热力图数据
// @ts-ignore
import typhoonGeoJson2010 from '../json/typhoon_path/2010.json'; // 导入 JSON 数据
import typhoonGeoJson2011 from '../json/typhoon_path/2011.json'; // 导入 JSON 数据
import typhoonGeoJson2012 from '../json/typhoon_path/2012.json'; // 导入 JSON 数据
import typhoonGeoJson2013 from '../json/typhoon_path/2013.json'; // 导入 JSON 数据
import typhoonGeoJson2014 from '../json/typhoon_path/2014.json'; // 导入 JSON 数据
import typhoonGeoJson2015 from '../json/typhoon_path/2015.json'; // 导入 JSON 数据
import typhoonGeoJson2016 from '../json/typhoon_path/2016.json'; // 导入 JSON 数据
import typhoonGeoJson2017 from '../json/typhoon_path/2017.json'; // 导入 JSON 数据
import typhoonGeoJson2018 from '../json/typhoon_path/2018.json'; // 导入 JSON 数据


interface YearlyTyphoonData {
  [province: string]: number;
}

// 定义一个接口来描述整个 typhoonCountData 的结构
interface TyphoonCountDataType {
  [year: string]: YearlyTyphoonData;
}

import typhoonCountData from '../json/typhoon_count_data.json'; // 导入 JSON 数据
const typedTyphoonCountData: TyphoonCountDataType = typhoonCountData;
import 'leaflet.heat';         // 引入热力图插件
import * as echarts from 'echarts';
import axios from 'axios';
//import * as d3 from 'd3-scale';
//import * as d3Interpolate from 'd3-interpolate'; // 用于颜色插值

import dataId_2019 from '../data/2019/data_id.json'
import distanceData_2019 from '../data/2019/distance.json'
import jsonData_2018 from '../data/2018/data.json'
import dataId_2018 from '../data/2018/data_id.json'
import distanceData_2018 from '../data/2018/distance.json'
import dataId_2017 from '../data/2017/data_id.json'
import distanceData_2017 from '../data/2017/distance.json'
import dataId_2016 from '../data/2016/data_id.json'
import distanceData_2016 from '../data/2016/distance.json'
import dataId_2015 from '../data/2015/data_id.json'
import distanceData_2015 from '../data/2015/distance.json'
import dataId_2014 from '../data/2014/data_id.json'
import distanceData_2014 from '../data/2014/distance.json'
import dataId_2013 from '../data/2013/data_id.json'
import distanceData_2013 from '../data/2013/distance.json'
import dataId_2012 from '../data/2012/data_id.json'
import distanceData_2012 from '../data/2012/distance.json'
import dataId_2011 from '../data/2011/data_id.json'
import distanceData_2011 from '../data/2011/distance.json'
import dataId_2010 from '../data/2010/data_id.json'
import distanceData_2010 from '../data/2010/distance.json'

const dialogVisible = ref(false); // 弹窗显示控制变量
const dialogVisibleYear = ref(false); // 单年份小窗口显示控制变量

const dialogWidth = '30%'; // 弹窗宽度
// 点击其他区域关闭小窗口
const handleClickOutside = (event: MouseEvent) => {
  const infoBox = document.querySelector('.info-box'); // 区间选择窗口
  const yearBox = document.querySelector('.year-box'); // 单年份窗口
  const formDataLeft = document.querySelector('.formDataLeft'); // 左侧菜单

  // 如果点击在 infoBox、yearBox 或 formDataLeft 内部，则不关闭小窗口
  if (
    infoBox?.contains(event.target as Node) ||
    yearBox?.contains(event.target as Node) ||
    formDataLeft?.contains(event.target as Node)
  ) {
    return;
  }

  // 否则隐藏所有小窗口
  dialogVisible.value = false;
  dialogVisibleYear.value = false;
};

onMounted(() => {
  initMap();
  document.addEventListener('click', handleClickOutside); // 添加点击事件监听
  // console.log(formDataLeft.selectedYear);

});

onUnmounted(() => {
  if (map.value){
  (map.value as any).remove();}
  document.removeEventListener('click', handleClickOutside); // 移除点击事件监听
});

async function updateTyphoonOptions() {
  const yearTyphoonMapping = {
	'2018': dataId_2018,
    '2017': ['0023_2017']
  };
  formDataLeft.typhoonOptions = yearTyphoonMapping[formDataLeft.singleSelectedYear as '2018' | '2017'] || ['没有数据'];
}
const line_option = reactive({
      legend: {
        show: true,
        data: [] as string[]
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      grid: {
        left: '3%',
        right: '8%',
        top: '20%',
        bottom: '0%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['广州', '福建', '浙江', '上海'],
        axisLabel: {
          // inside: true,
          // color: '#fff'
        },
        axisTick: {
          show: false
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#000000'
          }
        },
        z: 10
      },
      yAxis: {
        type: 'value',
      scale: true,
      splitNumber: 8,
      //min: 'dataMin', // 根据数据自动调整最小值
        axisLine: {
          show: true,
          lineStyle: {
            color: '#000000'
          }
        },
        axisTick: {
          show: false
        },
        // axisLabel: {
        //   color: '#999'
        // },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: '#BFBFBF'
          }
        }
      },
      series: [] as any,
      color: ['#001A6E', '#074799', '#009990', '#A1EEBD', '#3D3BF3', '#4CC9FE', '#006BFF', '#7AB2B2', '#BFACE2']
    })

const drawChart = (dataId:string[], distanceData:any) => {
    const chartDom =document.getElementById('typhoon-line-chart');
    if (!chartDom) {
      console.error(" 折线图容器未找到！");
      return;
    }
    if (echarts.getInstanceByDom(chartDom)) {
  // 如果存在，销毁它
  const instance = echarts.getInstanceByDom(chartDom);
  if (instance) {
    instance.dispose();
  }
}
    const myChart = echarts.init(chartDom);
    const seriesData = dataId.map((id:string, index:number) => {
      return {
        name: id,
        data: distanceData[id], 
        type: "line",
        itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: line_option.color[index % line_option.color.length] },
          { offset: 0.5, color: line_option.color[index % line_option.color.length] },
          { offset: 1, color: line_option.color[index % line_option.color.length] }
        ])
        },
        emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: line_option.color[index % line_option.color.length] },
          { offset: 0.7, color: line_option.color[index % line_option.color.length] },
          { offset: 1, color: line_option.color[index % line_option.color.length] }
          ])
        }
        },
      };
      });
      line_option.series = seriesData;
      line_option.legend.data = seriesData.map(s=> s.name);
      myChart.setOption(line_option);
};
function changePic(){
  readJsonFile();

}
function clearDate(){
  dialogVisibleYear.value = true;
  dialogVisible.value = false;
  nextTick(() => {
    const chartDom =document.getElementById('typhoon-line-chart');
    if (!chartDom) {
      console.error(" 折线图容器未找到！");
      return;
    }
  const myChart = echarts.init(chartDom);
	line_option.series = [];
	line_option.legend.data = [];
  myChart.setOption(line_option);
    });
}

const readJsonFile = () => {
  console.log(formDataLeft.singleSelectedYear);
  dialogVisibleYear.value = true;
  dialogVisible.value = false;
  let dataId: string[] = [], distanceData: any;
  if (formDataLeft.singleSelectedYear === '2018') {
    dataId = dataId_2018;
    distanceData = distanceData_2018;
    // startSequentialAnimations(2018);
  }
	else if(formDataLeft.singleSelectedYear == '2017'){
      dataId = dataId_2017;
      distanceData = distanceData_2017;
    }
	else if(formDataLeft.singleSelectedYear == '2016'){
	  dataId = dataId_2016;
    distanceData = distanceData_2016;
    startSequentialAnimations('2016');
	}
	else if(formDataLeft.singleSelectedYear === '2015'){
	  dataId = dataId_2015;
	  distanceData = distanceData_2015;
    startSequentialAnimations('2015');
	}
	else if(formDataLeft.singleSelectedYear === '2014'){
	  dataId = dataId_2014;
	  distanceData = distanceData_2014;
    startSequentialAnimations('2014');
	}
	else if(formDataLeft.singleSelectedYear === '2013'){
	  dataId = dataId_2013;
	  distanceData = distanceData_2013;
    startSequentialAnimations('2013');
	}
	else if(formDataLeft.singleSelectedYear === '2012'){
	  dataId = dataId_2012;
	  distanceData = distanceData_2012;
    startSequentialAnimations('2012');
	}
	else if(formDataLeft.singleSelectedYear === '2011'){
	  dataId = dataId_2011;
	  distanceData = distanceData_2011;
    startSequentialAnimations('2011');
	}
	else if(formDataLeft.singleSelectedYear === '2010'){
	  dataId = dataId_2010;
	  distanceData = distanceData_2010;
    startSequentialAnimations('2010');
	}
	else if(formDataLeft.singleSelectedYear === '2019'){
	  dataId = dataId_2019;
	  distanceData = distanceData_2019;
	}
	if (formDataLeft.changeType === '1') {
	  dataId = ['avg'];
	} 
  //  console.log(dataId);
   updateTyphoonOptions()
   nextTick(() => {
      drawChart(dataId, distanceData);
    });

};

// 定义DOM引用
const mapContainer = ref(null); // 地图容器DOM引用
const map = ref(null);
const center = ref([25.00, 115.25]); // 地图初始中心点坐标:经纬度
const leafletStore = useQLeafletStore(); // 使用自定义仓库
// @ts-ignore
let velocityLayer = null; // 风场图层
// @ts-ignore
let heatmapLayer = null; // 热力图图层

const typhoonRegionStats = reactive({
  浙江: 0,
  福建: 0,
  上海: 0,
  广东: 0,
});
const drawRadarChart = (radarData:any, years:string[], yearRange:string) => {
  const chartDom = document.getElementById('typhoon-radar-chart');
  if (!chartDom) {
    console.error("雷达图容器未找到！");
    return;
  }
  const myChart = echarts.init(chartDom);

  const option = {
    title: {
      text: `${yearRange}年间分年份台风数量统计图`, // 动态设置标题
      left: 'center',
      textStyle: {
        fontSize: 16,
      },
    },
    tooltip: {},
    legend: {
      data: ['浙江', '福建', '上海', '广东'],
      bottom: 0,
    },
    radar: {
      indicator: years.map(year => ({
        name: year,
        max: Math.max(...radarData.flat()) + 1,
      })),
      radius: '60%',
    },
    series: [
      {
        name: '台风数量',
        type: 'radar',
        symbolSize: 6, // 设置点的大小为 4
        areaStyle: { opacity: 0.2 }, // 填充区域，设置透明度为 0.2
        data: [
          {
            value: radarData[0],
            name: '浙江',
            itemStyle: { color: '#0C134F' }, // 自定义颜色
          },
          {
            value: radarData[1],
            name: '福建',
            itemStyle: { color: '#1D267D' }, // 自定义颜色
          },
          {
            value: radarData[2],
            name: '上海',
            itemStyle: { color: '#5C469C' }, // 自定义颜色
          },
          {
            value: radarData[3],
            name: '广东',
            itemStyle: { color: '#D4ADFC' }, // 自定义颜色
          },
        ],
      },
    ],
  };

  myChart.setOption(option);
};


const drawBarChart = (data: UnwrapNestedRefs<{ 福建: number; 上海: number; 广东: number; 浙江: number }> & {}, yearRange: string) => {
  const chartDom = document.getElementById('typhoon-bar-chart');
  if (!chartDom) {
    console.error("柱状图容器未找到！");
    return;
  }
  const myChart = echarts.init(chartDom);

  const option = {
    title: {
      text: `${yearRange}年间发生的台风数量统计图`, // 动态设置标题
      left: 'center', // 标题居中
      textStyle: {
        fontSize: 16,
      },
    },
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      top: '12%', // 调整图表与标题的距离
      left: '10%',
      right: '10%',
      bottom: '10%',
    },
    xAxis: {
      type: 'category',
      data: Object.keys(data), // 省份
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: Object.values(data), // 台风数量
        type: 'bar',
        barWidth: '55%',
        itemStyle: {
          color: function (params:any) {
            const colors = ['#4A628A', '#7AB2D3', '#B9E5E8', '#DFF2EB'];
            return colors[params.dataIndex % colors.length]; // 循环使用颜色
          },
          borderColor: '#000', // 设置柱子的边框颜色
          borderWidth: 0.8, // 设置柱子的边框宽度
        },
      },
    ],
  };

  myChart.setOption(option);
};


const handleYearLeft = (source:any) => {
  if (source === 'first-select') {
    console.log('第一个下拉框触发，显示小窗口');
    dialogVisibleYear.value = true; // 仅第一个下拉框触发小窗口
  } else {
    console.log(`其他下拉框触发，source: ${source}`);
  }
  if(formDataLeft.typhoon === '0005_2018'){
    initializeTyphoonLayer('2018',0,() => {
      removeTyphoonMap();
    });
  } else if(formDataLeft.typhoon === '0009_2018'){
    initializeTyphoonLayer('2018',1,() => {
      removeTyphoonMap();
    });
  } else if(formDataLeft.typhoon === '0010_2018'){
    initializeTyphoonLayer('2018',2,() => {
      removeTyphoonMap();
    });
   } else if(formDataLeft.typhoon === '0011_2018'){
    initializeTyphoonLayer('2018',3,() => {
      removeTyphoonMap();
    });
  } else if(formDataLeft.typhoon === '0014_2018'){
    initializeTyphoonLayer('2018',4,() => {
      removeTyphoonMap();
    });
  } else if(formDataLeft.typhoon === '0017_2018'){
    initializeTyphoonLayer('2018',5,() => {
      removeTyphoonMap();
    });
   } else if(formDataLeft.typhoon === '0019_2018'){
    initializeTyphoonLayer('2018',6,() => {
      removeTyphoonMap();
    });
  } else if(formDataLeft.typhoon === '0021_2018'){
    initializeTyphoonLayer('2018',7,() => {
      removeTyphoonMap();
    });
  } else if(formDataLeft.typhoon === '0024_2018'){
    initializeTyphoonLayer('2018',8,() => {
      removeTyphoonMap();
    });
  } else if(formDataLeft.typhoon === '0026_2018'){
    initializeTyphoonLayer('2018',9,() => {
      removeTyphoonMap();
    });
  } else if(formDataLeft.typhoon === '0027_2018'){
    initializeTyphoonLayer('2018',10,() => {
      removeTyphoonMap();
    });
  } else if(formDataLeft.typhoon === '0023_2017'){
    initializeTyphoonLayer('2017',7,() => {
      removeTyphoonMap();
    });
  } else {
    console.log('其他年份，不显示台风图层');
  }
};



const handleYearChangeLeft = (yearRange: string) => {
  console.log('左边选择的年份区间:', yearRange);
  formData.selectedYear = yearRange; // 更新年份
  console.log('左边选择的年份区间:', formDataLeft.selectedYear);
  dialogVisible.value = true; // 显示弹窗
  dialogVisibleYear.value = false; // 显示弹窗
  // 显示弹窗

  // 初始化统计结果
  const tempStats = { 浙江: 0, 福建: 0, 上海: 0, 广东: 0 };
  const radarData: number[][] = [[], [], [], []]; // 四个省份的年份数据，每个数组存储数字类型的数据
  const years: string[] = []; // 用于存储年份标签

  // 解析年份区间
  const [startYear, endYear] = yearRange.split('-').map(Number);

  // 遍历年份区间，累加台风数据
  for (let year = startYear; year <= endYear; year++) {
    const yearData = typedTyphoonCountData[year.toString()];
    if (yearData) {
      years.push(year.toString());
      radarData[0].push(yearData.浙江 || 0);
      radarData[1].push(yearData.福建 || 0);
      radarData[2].push(yearData.上海 || 0);
      radarData[3].push(yearData.广东 || 0);
      tempStats.浙江 += yearData.浙江 || 0;
      tempStats.福建 += yearData.福建 || 0;
      tempStats.上海 += yearData.上海 || 0;
      tempStats.广东 += yearData.广东 || 0;
    }
  }

  // 更新统计数据
  Object.assign(typhoonRegionStats, tempStats);

  // 绘制柱状图和雷达图（延迟到 DOM 渲染完成后执行）
  nextTick(() => {
    drawBarChart(typhoonRegionStats, formDataLeft.selectedYear);
    drawRadarChart(radarData, years, yearRange);
  });
};

const formData = reactive({
    selectedOption: 'wind1', // 默认选项
    selectedYear: '',
});

interface FormDataLeft {
  selectedOption: string;
  selectedYear: string;
  singleSelectedYear: string;
  changeType: string;
  typhoon: string;
  typhoonOptions: string[];
}

const formDataLeft = reactive<FormDataLeft>({
    selectedOption: 'wind1', // 默认选项
    selectedYear: '',
    singleSelectedYear: '',
    changeType: '0',
    typhoon: '',
    typhoonOptions: []
});
// 处理左侧的 formData 显示与隐藏
const isVisibleLeft = reactive({
  showDivLeft: true, // 控制左侧区域显示
});

// 控制左侧图标显示的函数
const handleChangeLeft = () => {
  isVisibleLeft.showDivLeft = true;
};

// 控制左侧区域隐藏的函数
const handleLeafLeft = () => {
  isVisibleLeft.showDivLeft = false;
};
const isVisible = reactive({
  showDiv1: true, // 默认显示
});

const zoomLevel = ref(3); // 地图缩放级别

// 风场参数
const options = reactive({
  displayValues: true, // 是否显示速度值
  displayOptions: {
    velocityType: '风向/风速', // 显示的类型名称
    displayPosition: 'bottomleft', // 显示位置
    displayEmptyString: 'No wind data', // 没有数据时显示的文字
    speedUnit: 'm/s', // 速度单位
    speedString: 'Speed', // 速度标签
  },
  data: windJson, // 风场数据
  minVelocity: 0, // 最小速率
  maxVelocity: 16, // 最大速率
  velocityScale: 0.1, // 风速比例 (粒子的小尾巴长度)
  particleAge: 90, // 粒子在再生之前绘制的最大帧数
  particleMultiplier: 1 / 2000, // 粒子的数量
  lineWidth: 2, // 粒子的粗细
  frameRate: 10, // 定义每秒执行的次数
  // 定义颜色渐变，用于根据速度值映射不同的颜色
  colorScale: ['#11999e', '#32CD32'],
});

// ###############  地图的图层  ################
// 初始化地图
const initMap = () => {
  // 设置天地图图层加载参数
  const options = {
  subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
  };
    // 通过 QXStore 获取天地图矢量图层和注记图层
    const mapVec = leafletStore.setChinaProvider(TianDiTu.Satellite.Map, options);
    const mapCva = leafletStore.setChinaProvider(TianDiTu.Satellite.Annotion, options);
    // 将两个图层组合成一个Layer Group
    const layers = L.layerGroup([mapVec, mapCva]);
    // 实例化地图对象，设置中心点、缩放级别、最小最大缩放限制等配置
    // @ts-ignore
    map.value = L.map(mapContainer.value, {
      center: center.value, // 中心点坐标
      zoom: 5, // 初始缩放级别
      minZoom: 3, // 最小缩放级别
      maxZoom: 8, // 最大缩放级别
      noWrap: true, // 禁止地图水平滚动
      layers: [layers], // 加载图层组
      zoomControl: true, // 显示缩放控制
      attributionControl: false, // 隐藏版权信息
    });
    // 监听 zoomend 事件来更新 zoomLevel
    // @ts-ignore
    map.value.on('zoomend', () => {
      // @ts-ignore
      zoomLevel.value = map.value.getZoom();
    });
};

// #################  绘制风场图  #########################
/*** 初始化风场图层:见leaflet的代码 */
const initVelocity = () => {
  // @ts-ignore
  if (velocityLayer) {
    // @ts-ignore
    map.value.removeLayer(velocityLayer);  // 如果已存在，先移除旧的风场图层
  }
  // @ts-ignore
  velocityLayer = L.velocityLayer(options).addTo(map.value);
};
// 移除风场图层
const removeVelocityLayer = () => {
  // @ts-ignore
if (velocityLayer) {
  // @ts-ignore
  map.value.removeLayer(velocityLayer);  // 从地图上移除风场图层
  velocityLayer = null;  // 清空图层引用
}
};

//  ############################ 绘制热力图 ########################################
// const dataJson = ref([
//   [106.53, 29.57, 22], // 经度，纬度，温度值
//   [106.54, 29.58, 24],
//   [106.55, 29.59, 21],
//   [106.56, 29.60, 23],
//   [106.57, 29.61, 25],
//   [106.58, 29.62, 26],
//   [106.59, 29.63, 20],
//   [106.60, 29.64, 22],
//   [106.61, 29.65, 23],
//   [106.62, 29.66, 24],
//   [106.63, 29.67, 22],
//   [106.64, 29.68, 21],
//   [106.65, 29.69, 23],
//   [106.66, 29.70, 24],
//   [106.67, 29.71, 25]
// ]);

// 初始化热力图图层


// 动态生成颜色映射

const initHeatmap = () => {
  // 如果已有热力图层，先移除它
  // @ts-ignore
  if (heatmapLayer) {
    // @ts-ignore
    map.value.removeLayer(heatmapLayer);  // 从地图上移除热力图图层
  }
  // 创建热力图数据，温度值作为权重传入
  // @ts-ignore
  const formattedData = dataJson.map(([lng, lat, temp]) => {
    return [lat, lng, temp];  // 经度和纬度位置，温度作为权重
  });

  // @ts-ignore
  heatmapLayer = L.heatLayer(formattedData, {
    radius: 12,      // 热力图点的半径
    blur: 50,         // 模糊度
    maxZoom: 8,      // 最大缩放级别
    minZoom: 3,      // 最小缩放级别
    zoom: 3,
    gradient: {
      '0.0': 'blue',   // 温度最低点
      '0.1': 'lightblue',
      '0.2': 'cyan',
      '0.3': 'green',
      '0.4': 'yellow',
      '0.5': 'orange',
      '0.6': 'red',
      '0.7': 'darkred',
      '0.8': 'purple',
      '0.9': 'maroon',
      '1.0': 'black'
    }  // 温度最高点
  }).addTo(map.value);  // 将热力图添加到地图
};
// 移除热力图图层的函数
const removeHeatmap = () => {
  // @ts-ignore
if (heatmapLayer) {
  // @ts-ignore
  map.value.removeLayer(heatmapLayer);  // 移除热力图
  heatmapLayer = null;  // 清空热力图图层变量
}
};

const handleChange = () => {
  isVisible.showDiv1 = true
}

const handleLeaf = () => {
  isVisible.showDiv1 = false
}

// ##################### 台风路径 #####################
const typhoonGeoJsonData:{[year: string]: any}= {
  '2010': typhoonGeoJson2010,
  '2011': typhoonGeoJson2011,
  '2012': typhoonGeoJson2012,
  '2013': typhoonGeoJson2013,
  '2014': typhoonGeoJson2014,
  '2015': typhoonGeoJson2015,
  '2016': typhoonGeoJson2016,
  '2017': typhoonGeoJson2017,
  '2018': typhoonGeoJson2018,
};

const updateInterval = 100; // Update every 100ms
let geoJsonLayer: any = null; // Current GeoJSON layer for typhoon path
let currentTyphoonEyeLayer: any = null; // Current typhoon eye layer
let fadeOutTimeout: any = null; // Timeout for fade out effect
let currentIndex = 0; // Current index to display

// Initialize the typhoon layer and start animation
const initializeTyphoonLayer = (year:string, index:any, onComplete:any) => {
  // Validate if the year exists in the GeoJSON data map
  if (!typhoonGeoJsonData[year]) {
    console.error(`Data for year ${year} is not available.`);
    return;
  }

  // Load the data for the selected year
  const typhoonData = typhoonGeoJsonData[year];

  // Remove previous layers if they exist
  if (geoJsonLayer) {
    (map.value! as any).removeLayer(geoJsonLayer);
    geoJsonLayer.clearLayers();
  }

  // Create a new GeoJSON layer for each animation
  geoJsonLayer = L.geoJSON(null, {
    style: function (feature) {
      return {
        fillColor: "#ffff00",
        color: 'lightblue',   // Red color with opacity for dramatic effect
        weight: 6,                         // Make the line thicker
        opacity: 0.9,                      // Set high opacity
        fillcolor: "yellow",  // Use a bright color for fill (optional)
        fillOpacity: 0.2,                  // Set opacity for the fill
        dashArray: '5, 5',                 // Optional: dashed line to simulate wind or turbulence
        lineJoin: 'round',                 // Smooth corners for the lines
      };
    },
  }).addTo(map.value!);

  currentIndex = 0; // Reset current index
  // Function to animate the typhoon path
  const animateTyphoon = () => {
    if (currentIndex < typhoonData.features[index].geometry.coordinates.length) {
      const currentCoordinates = typhoonData.features[index].geometry.coordinates.slice(0, currentIndex + 1);

      // Clear previous layers and add new coordinates
      geoJsonLayer.clearLayers();
      geoJsonLayer.addData({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: currentCoordinates,
        },
        properties: {},
      });

      // Remove the previous typhoon eye if it exists
      if (currentTyphoonEyeLayer && map.value) {
        (map.value as any).removeLayer(currentTyphoonEyeLayer);
      }

      // Add the current typhoon eye with a blurred effect
      const currentEye = typhoonData.features[index].geometry.coordinates[currentIndex];
      currentTyphoonEyeLayer = L.circleMarker([currentEye[1], currentEye[0]], {
        radius: 10,
        fillOpacity: 0.4,
        weight: 1,
        opacity: 0.6,
        className: "typhoon-eye", // CSS for blur effect
      }).addTo(map.value!);

      // Display the typhoon number at the start or during the path
      if (currentIndex === 0) {
      console.log(typhoonData.features[index].properties.id);
      const typhoonNumber = typhoonData.features[index].properties.id || `台风 ${index + 1}`;  // 你可以根据实际数据定义台风编号
      L.marker([currentEye[1], currentEye[0]])
        .addTo(map.value!)
        .bindPopup(typhoonNumber)
        .openPopup();
      }

      // Move to the next point
      currentIndex++;

      // Continue the animation
      setTimeout(animateTyphoon, updateInterval);
    } else {
      // Fade out the typhoon eye once animation is complete
      fadeOutTyphoonEye(() => {
        onComplete();
      });
    }
  };

  // Fade out the typhoon eye effect
  const fadeOutTyphoonEye = (callback:any) => {
    let opacity = 0.6;
    const fadeOutStep = () => {
      if (opacity > 0) {
        opacity -= 0.05;
        currentTyphoonEyeLayer.setStyle({
          fillOpacity: opacity,
          opacity: opacity,
        });
        fadeOutTimeout = setTimeout(fadeOutStep, 100);
      } else{
        (map.value! as any).removeLayer(currentTyphoonEyeLayer);
        callback();
      }
    };
    fadeOutStep();
  };

  // Start the animation
  animateTyphoon();
};

// Function to remove all typhoon layers (global cleanup)
const removeTyphoonMap = () => {
  // Clear the geoJsonLayer if it exists
  if (geoJsonLayer) {
    geoJsonLayer.clearLayers();
    (map.value! as any).removeLayer(geoJsonLayer);
    geoJsonLayer = null;  // Reset geoJsonLayer reference
  }

  // Remove the current typhoon eye layer if it exists
  if (currentTyphoonEyeLayer) {
    (map.value! as any).removeLayer(currentTyphoonEyeLayer);
    currentTyphoonEyeLayer = null;  // Reset the typhoon eye layer reference
  }

  // Clear any running fade-out timeouts
  if (fadeOutTimeout) {
    clearTimeout(fadeOutTimeout);
    fadeOutTimeout = null;  // Reset fadeOutTimeout reference
  }

  // Reset current index for the next animation
  currentIndex = 0;
};

// 主函数：启动台风路径动画的顺序
const startSequentialAnimations = (year:string, index = 0) => {
  // Remove previous typhoon map if any
  removeTyphoonMap(); // Clear previous map layers before starting new animation

  // 选择对应年份的 GeoJSON 数据
  const typhoonData = typhoonGeoJsonData[year];

  // 检查数据是否存在
  if (!typhoonData) {
    console.error(`没有找到年份为 ${year} 的台风路径数据`);
    return;
  }

  // 如果所有路径动画完成
  if (index >= typhoonData.features.length) {
    console.log(`所有 ${year} 年台风路径动画已完成`);
    return;
  }

  console.log(`启动 ${year} 年第 ${index + 1} 条路径动画`);

  // 初始化新的台风路径动画
  initializeTyphoonLayer(year, index, () => {
    // 当前路径动画完成后，启动下一条路径动画
    startSequentialAnimations(year, index + 1);
  });
};

// ###################################

// 监听 selectedOption 的变化，动态调用初始化函数
watch(() => formData.selectedOption, (newValue) => {
      initializeLayer(newValue);
});
// 使用 watch 监听 zoomLevel 变化，可以在此做其他操作，比如发送请求等
watch(zoomLevel, (newZoom) => {
  // console.log('当前缩放级别:', newZoom);
  // @ts-ignore
  if (selectedOption === 'wind') {
    initVelocity();
    // @ts-ignore
  } else if(selectedOption === 'heat') {
    initHeatmap();
  }
  // 监听年份选项变化
watch(() => formDataLeft.selectedYear, (newValue) => {
  if (newValue) {
    dialogVisible.value = true; // 选择年份后显示弹窗
  }
});
});

// 根据选中的选项执行相应的初始化函数
// @ts-ignore
const initializeLayer = (selectedOption) => {

  if (selectedOption === 'wind') {
    formData.selectedOption = 'wind';
    removeHeatmap();
    initVelocity();
  } else if(selectedOption === 'heat') {
    formData.selectedOption = 'heat';
    removeVelocityLayer();
    initHeatmap();
  }
};

// 组件卸载前清理地图和图表资源，防止内存泄漏
onUnmounted(() => {
  // @ts-ignore
  map.value?.remove();
});


</script>

<style lang="scss" scoped>
.map-container {
// position: relative;
width: 2500px;
height: 100vh;
z-index: 1;
}
::v-deep {
.leaflet-bottom {
  margin-bottom: 100px;
  bottom: 1ch;
}
.leaflet-right {
  margin-right: 100px;
  right: 1ch;
}
}

.radio-group {
margin-top: 10px;
display: flex;
flex-direction: column;
}

.el-radio {
margin-bottom: 10px; /* 每个选项之间的间距 */
}
.el-form-item {
margin-bottom: 20px; /* 调整表单项的间距 */
}
.formData {
background-color: #ffffff;
width: 150px;
height: 100px;
position: absolute;
top: 40px;
right: 20px;
z-index: 12;
border-width: 2px;
border-color: #2e2e2e;
}
.formDataLeft {
background-color: #ffffff;
width: 200px;
height: 150px;
position: absolute;
top: 100px;
left: 60px;
z-index: 12;
border-width: 2px;
border-color: #2e2e2e;
}
.formData:first-of-type {
  left: 20px; /* 左上角 */
}
.logo {
position: absolute;
top: 20px;
right: 20px;
z-index: 12;
}
.logoleft {
position: absolute;
top: 80px;
left: 40px;
z-index: 12;
}
.typhoon-eye {
  position: relative;
  width: 30px;
  height: 30px;
  background: radial-gradient(circle, #87CEEB 10%, #1E90FF 50%, #00008B 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5); /* 给台风眼加上阴影，增加立体感 */
  border: 4px solid #ffffff; /* 外环边框 */
}
.info-box {
  position: absolute;
  top: 100px;
  left: 250px;
  width: 350px;
  height: 650px;
  background-color: white;
  border: 1px solid #ddd;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  cursor: default;
}

.info-content {
  padding: 15px;
  font-size: 14px;
  color: #333;
}

.year-box {
  position: absolute;
  top: 100px;
  left: 250px;
  width: 350px;
  height: 530px;
  background-color: white;
  border: 1px solid #ddd;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  cursor: default;
}

.year-box .info-content {
  padding: 15px;
  font-size: 14px;
  color: #333;
}


h3 {
  font-size: 19px;
  color: #333;
  text-align: center;
  font-weight: bold;
}
</style>